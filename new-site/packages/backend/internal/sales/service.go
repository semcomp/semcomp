package sales

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"
	"backend/internal/product"
	"backend/internal/user"

	"gorm.io/gorm"
)

type SaleService interface {
	// CreateSale cria o pedido e, quando request.PaymentMethod == "pix",
	// também dispara a cobrança no Mercado Pago (unifica os antigos
	// SaleService.CreateSale e PaymentService.CreatePix).
	CreateSale(userNumber uint, email string, request CreateSaleRequest) (*Sale, error)

	// HandleWebhook processa as notificações do Mercado Pago (antigo
	// PaymentService.HandleWebhook), agora atualizando a Sale diretamente.
	HandleWebhook(dataID, xSignature, xRequestID string) error

	// GetStatus retorna o status efetivo de uma venda do usuário, considerando
	// expiração de PIX pendente (antigo PaymentService.GetStatus, para polling).
	// Retorna NotFoundError se a venda não pertencer ao userNumber informado.
	GetStatus(userNumber uint, saleID uint) (string, error)

	GetSaleByID(userNumber uint, saleID uint) (*Sale, error)
	GetUserSales(userNumber uint) ([]Sale, error)
	GetAllSales(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SaleListResult, error)
	UpdateSaleByID(id string, request UpdateSaleRequest) (*Sale, error)
	DeleteSaleByID(id string) error

	// Operação de Item (Backoffice)
	UpdateItemPickup(itemID string, request UpdateSaleItemPickupRequest) (*SaleItem, error)

	// GetConsumed retorna os ids de produtos de compra única (COFFEE/COMBO)
	// indisponíveis para o usuário — já consumidos ou travados por um pedido
	// ativo (incluindo o fechamento via combos).
	GetConsumed(userNumber uint) ([]uint, error)
}

type saleService struct {
	saleRepo    SaleRepository
	productRepo product.ProductRepository
	papfeRepo   user.PapfeDocumentRepository
	httpClient  *http.Client
}

func NewSaleService(saleRepo SaleRepository, productRepo product.ProductRepository, papfeRepo user.PapfeDocumentRepository) SaleService {
	return &saleService{
		saleRepo:    saleRepo,
		productRepo: productRepo,
		papfeRepo:   papfeRepo,
		httpClient:  &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *saleService) CreateSale(userNumber uint, email string, request CreateSaleRequest) (*Sale, error) {
	var totalAmount float64
	var saleItems []SaleItem
	var consumedProductIDs []uint

	status := request.Status
	if status == "" {
		status = SaleStatusPending
	}

	// Só pedidos ativos (PENDENTE/PAGO) travam a compra única. Pedidos criados
	// direto em status final não reservam o item.
	shouldLock := status == SaleStatusPending || status == SaleStatusPaid

	// Conjunto fechado de produtos indisponíveis para este usuário (coffees e
	// combos já consumidos/travados). Calculado uma única vez para todos os itens.
	unavailable, err := s.getUnavailableProductIDs(userNumber)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao verificar disponibilidade dos itens", err)
	}
	unavailableSet := make(map[uint]struct{}, len(unavailable))
	for _, id := range unavailable {
		unavailableSet[id] = struct{}{}
	}

	// Verifica se o usuário tem PAPFE aprovado para aplicar desconto de 50%.
	hasPapfeDiscount := false
	if email != "" {
		doc, papfeErr := s.papfeRepo.FindByEmail(email)
		if papfeErr == nil && doc.IsApproved != nil && *doc.IsApproved {
			hasPapfeDiscount = true
		}
	}

	for _, itemReq := range request.Items {
		prod, err := s.productRepo.GetByID(itemReq.ProductID)
		if err != nil {
			return nil, apierrors.ValidationError("O produto com ID "+strconv.Itoa(int(itemReq.ProductID))+" não foi encontrado", err)
		}

		if !prod.IsSelling {
			return nil, apierrors.ValidationError("O produto '"+strconv.Itoa(int(prod.ID))+"' não está mais disponível para venda", nil)
		}

		// Compra única: COFFEE e COMBO só podem ser comprados 1 vez, quantidade 1.
		if prod.Type == product.ProductTypeCoffee || prod.Type == product.ProductTypeCombo {
			if itemReq.Quantity != 1 {
				return nil, apierrors.ValidationError("Este produto só pode ser comprado em quantidade 1", nil)
			}
			if _, taken := unavailableSet[prod.ID]; taken {
				return nil, apierrors.ValidationError("Este item já foi consumido ou já está reservado em outro pedido", nil)
			}
			if shouldLock {
				consumedProductIDs = append(consumedProductIDs, prod.ID)
			}
		}

		unitPrice := prod.Price
		if hasPapfeDiscount {
			unitPrice = math.Round(prod.Price*0.5*100) / 100
		}
		quantity := itemReq.Quantity
		totalAmount += unitPrice * float64(quantity)

		saleItems = append(saleItems, SaleItem{
			ProductID:  prod.ID,
			Quantity:   quantity,
			UnitPrice:  unitPrice,
			IsPickedUp: false, // Default na criação do pedido
		})
	}

	newSale := Sale{
		SaleUserNumber:      userNumber,
		Status:              status,
		PaymentMethod:       request.PaymentMethod,
		TotalAmount:         totalAmount,
		Items:               saleItems,
		DietaryRestrictions: request.DietaryRestrictions,
	}

	// Persiste a venda e, se houver itens de compra única, as travas na MESMA
	// transação (CreateWithConsumed reverte tudo se algum item já estiver
	// travado por outro pedido ativo).
	if len(consumedProductIDs) > 0 {
		err = s.saleRepo.CreateWithConsumed(&newSale, consumedProductIDs)
	} else {
		err = s.saleRepo.Create(&newSale)
	}
	if err != nil {
		// CreateWithConsumed reverte a venda com um ValidationError quando um
		// item já está travado por outro pedido ativo — propaga a mensagem amigável.
		var apiErr *apierrors.APIError
		if errors.As(err, &apiErr) {
			return nil, apiErr
		}
		return nil, apierrors.InternalServerError("Erro ao criar pedido", err)
	}

	// Se o pagamento for via PIX, dispara a cobrança no Mercado Pago.
	if strings.EqualFold(request.PaymentMethod, "pix") {
		if err := s.createPixCharge(&newSale, email, request.Description); err != nil {
			return nil, err
		}
	}

	createdSale, err := s.saleRepo.GetByID(newSale.ID)
	if err != nil {
		return nil, apierrors.InternalServerError("Pedido criado, mas ocorreu um erro ao carregar os dados", err)
	}

	// GetByID recarrega do banco e perde os campos transitórios do PIX; repõe aqui.
	createdSale.QRCode = newSale.QRCode
	createdSale.QRCodeBase64 = newSale.QRCodeBase64
	createdSale.PixExpiration = newSale.PixExpiration

	return createdSale, nil
}

// createPixCharge cria a cobrança PIX no Mercado Pago para uma venda já persistida
// e preenche os campos transitórios de QR code em `sale` (antigo
// PaymentService.CreatePix, sem mais criar uma entidade `Payment` separada).
func (s *saleService) createPixCharge(sale *Sale, email, description string) error {
	token := os.Getenv("MERCADOPAGO_ACCESS_TOKEN")
	if token == "" {
		return apierrors.InternalServerError("MERCADOPAGO_ACCESS_TOKEN não configurado", nil)
	}

	if description == "" {
		description = "Semcomp - Compra de produtos"
	}

	body := map[string]interface{}{
		"transaction_amount": sale.TotalAmount,
		"description":        description,
		"payment_method_id":  "pix",
		"external_reference": fmt.Sprintf("sale-%d", sale.ID),
		"payer": map[string]interface{}{
			"email": email,
		},
	}
	if backendURL := os.Getenv("BACKEND_URL"); backendURL != "" &&
		!strings.Contains(backendURL, "localhost") &&
		!strings.Contains(backendURL, "127.0.0.1") {
		body["notification_url"] = backendURL + "/webhook/mercadopago"
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return apierrors.InternalServerError("Erro ao montar requisição PIX", err)
	}

	httpReq, err := http.NewRequest("POST", "https://api.mercadopago.com/v1/payments", strings.NewReader(string(jsonBody)))
	if err != nil {
		return apierrors.InternalServerError("Erro ao montar requisição ao Mercado Pago", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Idempotency-Key", fmt.Sprintf("pix-%d-%d", sale.SaleUserNumber, sale.ID))

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return apierrors.InternalServerError("Erro ao criar pagamento PIX", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return apierrors.InternalServerError("Erro ao decodificar resposta do Mercado Pago", err)
	}

	if resp.StatusCode >= 400 {
		log.Printf("[PIX] Mercado Pago erro %d: %v", resp.StatusCode, result)
		return apierrors.InternalServerError(
			fmt.Sprintf("Mercado Pago retornou erro (status %d): %v", resp.StatusCode, result),
			nil,
		)
	}

	// Grava o MP payment ID imediatamente.
	if mpIDFloat, ok := result["id"].(float64); ok {
		mpID := fmt.Sprintf("%.0f", mpIDFloat)
		_ = s.saleRepo.SetMercadoPagoID(sale.ID, mpID)
	}

	// Extrai QR code do payload do Mercado Pago.
	if poi, ok := result["point_of_interaction"].(map[string]interface{}); ok {
		if txData, ok := poi["transaction_data"].(map[string]interface{}); ok {
			sale.QRCode, _ = txData["qr_code"].(string)
			sale.QRCodeBase64, _ = txData["qr_code_base64"].(string)
		}
	}

	expiration := sale.CreatedAt.Add(PixExpirationWindow)
	sale.PixExpiration = &expiration

	return nil
}

// mapMercadoPagoStatus converte o status retornado pelo Mercado Pago para o
// SaleStatus interno.
func mapMercadoPagoStatus(mpStatus string) SaleStatus {
	switch mpStatus {
	case "approved":
		return SaleStatusPaid
	case "rejected":
		return SaleStatusRejected
	case "refunded", "charged_back":
		return SaleStatusRefunded
	case "cancelled":
		return SaleStatusCanceled
	default:
		return SaleStatusPending
	}
}

// HandleWebhook valida a assinatura, busca o pagamento real na API do MP
// e atualiza o status da venda pelo external_reference (nosso ID interno).
func (s *saleService) HandleWebhook(dataID, xSignature, xRequestID string) error {
	if dataID == "" {
		return nil
	}

	if err := s.verifySignature(dataID, xSignature, xRequestID); err != nil {
		return apierrors.UnauthorizedError("Assinatura do webhook inválida", err)
	}

	token := os.Getenv("MERCADOPAGO_ACCESS_TOKEN")
	url := fmt.Sprintf("https://api.mercadopago.com/v1/payments/%s", dataID)

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return apierrors.InternalServerError("Erro ao montar requisição ao Mercado Pago", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+token)

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return apierrors.InternalServerError("Erro ao consultar pagamento no Mercado Pago", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return apierrors.InternalServerError(fmt.Sprintf("Mercado Pago retornou status %d ao consultar pagamento", resp.StatusCode), nil)
	}

	var mpPayment map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&mpPayment); err != nil {
		return apierrors.InternalServerError("Erro ao decodificar pagamento do Mercado Pago", err)
	}

	mpStatus, ok := mpPayment["status"].(string)
	if !ok {
		return apierrors.InternalServerError("Resposta do Mercado Pago sem status válido", nil)
	}

	externalRef, ok := mpPayment["external_reference"].(string)
	if !ok || !strings.HasPrefix(externalRef, "sale-") {
		return apierrors.InternalServerError("external_reference ausente ou inválido no pagamento do MP", nil)
	}

	saleID, err := strconv.ParseUint(strings.TrimPrefix(externalRef, "sale-"), 10, 64)
	if err != nil {
		return apierrors.InternalServerError("Não foi possível extrair o ID interno do external_reference", err)
	}

	existing, err := s.saleRepo.GetByID(uint(saleID))
	if err != nil {
		return apierrors.NotFoundError("Venda interna não encontrada para esse webhook", err)
	}

	// Reconciliação de valor: alerta se o valor do MP não bate com o registrado.
	if amount, ok := mpPayment["transaction_amount"].(float64); ok {
		if amount != existing.TotalAmount {
			log.Printf("[ALERTA] divergência de valor na venda %d: esperado %.2f, recebido %.2f\n",
				existing.ID, existing.TotalAmount, amount)
		}
	}

	newStatus := mapMercadoPagoStatus(mpStatus)
	if existing.Status == newStatus {
		return nil
	}

	updateData := map[string]interface{}{"status": newStatus}
	// Grava o MercadoPagoID na primeira vez que soubermos dele.
	if existing.MercadoPagoID == nil {
		updateData["mercado_pago_id"] = dataID
	}

	if err := s.saleRepo.UpdateByID(existing.ID, updateData); err != nil {
		return err
	}

	Hub.Publish(existing.ID, string(newStatus))

	// Sincroniza as travas de compra única com o novo status: PAGO re-trava
	// (se ainda não estiver), REJEITADO/CANCELADO/REEMBOLSADO destrava.
	return s.syncConsumptionForSale(existing.ID)
}

// verifySignature confere a assinatura enviada pelo Mercado Pago
// usando o secret configurado no painel de webhooks.
// Formato do header: "ts=1234567890,v1=abcdef..."
// Manifest assinado: "id:{data.id};request-id:{x-request-id};ts:{ts};"
func (s *saleService) verifySignature(dataID, xSignature, xRequestID string) error {
	secret := os.Getenv("MERCADOPAGO_WEBHOOK_SECRET")
	if secret == "" {
		return apierrors.InternalServerError("Variáveis de ambiente não configurado", nil)
	}
	if xSignature == "" {
		return apierrors.ValidationError("Assinatura ausente", nil)
	}

	var ts, v1 string
	for _, part := range strings.Split(xSignature, ",") {
		kv := strings.SplitN(strings.TrimSpace(part), "=", 2)
		if len(kv) != 2 {
			continue
		}
		switch kv[0] {
		case "ts":
			ts = kv[1]
		case "v1":
			v1 = kv[1]
		}
	}
	if ts == "" || v1 == "" {
		return apierrors.ValidationError("x-signature malformado", nil)
	}

	manifest := fmt.Sprintf("id:%s;request-id:%s;ts:%s;", strings.ToLower(dataID), xRequestID, ts)

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(manifest))
	expected := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expected), []byte(v1)) {
		return apierrors.UnauthorizedError("Assinatura inválida", nil)
	}
	return nil
}

// GetStatus retorna o status efetivo (considerando expiração de PIX) para polling.
func (s *saleService) GetStatus(userNumber uint, saleID uint) (string, error) {
	sale, err := s.saleRepo.GetByID(saleID)
	if err != nil {
		return "", err
	}
	if sale.SaleUserNumber != userNumber {
		return "", apierrors.NotFoundError("Venda não encontrada", nil)
	}
	return string(sale.EffectiveStatus()), nil
}

func (s *saleService) GetSaleByID(userNumber uint, saleID uint) (*Sale, error) {
	sale, err := s.saleRepo.GetByID(saleID)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar a venda", err)
	}

	if sale.SaleUserNumber != userNumber {
		return nil, apierrors.NotFoundError("Venda não encontrada ou não pertence ao usuário", nil)
	}

	return sale, nil
}

func (s *saleService) GetUserSales(userNumber uint) ([]Sale, error) {
	sales, err := s.saleRepo.GetByUserNumber(userNumber)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar compras", err)
	}
	return sales, nil
}

func (s *saleService) GetAllSales(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SaleListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}
	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
	}
	if sortBy == "" {
		sortBy = "created_at"
	}
	if sortOrder == "" {
		sortOrder = "desc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"id":             true,
		"status":         true,
		"total_amount":   true,
		"created_at":     true,
		"user_number":    true,
		"payment_method": true,
	}
	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parâmetro 'sort_by' inválido", nil)
	}

	offset := (page - 1) * limit
	query := SaleListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.saleRepo.GetAll(query)
}

func (s *saleService) UpdateSaleByID(id string, request UpdateSaleRequest) (*Sale, error) {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("ID da venda inválido", err)
	}

	_, err = s.saleRepo.GetByID(uint(parsedID))
	if err != nil {
		return nil, err
	}

	updateData := make(map[string]interface{})
	if request.Status != "" {
		updateData["status"] = request.Status
	}
	if request.PaymentMethod != "" {
		updateData["payment_method"] = request.PaymentMethod
	}
	if request.DietaryRestrictions != nil {
		updateData["dietary_restrictions"] = *request.DietaryRestrictions
	}

	if len(updateData) > 0 {
		err = s.saleRepo.UpdateByID(uint(parsedID), updateData)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, apierrors.NotFoundError("Venda não encontrada", err)
			}
			return nil, apierrors.InternalServerError("Erro ao atualizar venda", err)
		}
		if request.Status != "" {
			Hub.Publish(uint(parsedID), string(request.Status))
		}
	}

	// Sincroniza as travas de compra única com o status atual (destrava em
	// CANCELADO/REEMBOLSADO/EXPIRADO/REJEITADO, re-trava em PAGO). Idempotente.
	if err := s.syncConsumptionForSale(uint(parsedID)); err != nil {
		return nil, apierrors.InternalServerError("Venda atualizada, mas erro ao sincronizar a disponibilidade dos itens", err)
	}

	return s.saleRepo.GetByID(uint(parsedID))
}

func (s *saleService) DeleteSaleByID(id string) error {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return apierrors.ValidationError("ID da venda inválido", err)
	}

	err = s.saleRepo.DeleteByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Venda não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao deletar venda", err)
	}

	// Libera as travas de compra única originadas por essa venda (a exclusão do
	// sale não cascateia para consumed_items, que não tem FK para sales).
	if err := s.saleRepo.DeleteConsumedBySale(uint(parsedID)); err != nil {
		return apierrors.InternalServerError("Venda deletada, mas erro ao liberar a disponibilidade dos itens", err)
	}
	return nil
}

func (s *saleService) UpdateItemPickup(itemID string, request UpdateSaleItemPickupRequest) (*SaleItem, error) {
	parsedID, err := strconv.ParseUint(itemID, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("ID do item inválido", err)
	}

	err = s.saleRepo.UpdateItemPickup(uint(parsedID), request.IsPickedUp)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Item da venda não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar status de retirada", err)
	}

	return s.saleRepo.GetSaleItemByID(uint(parsedID))
}

// getUnavailableProductIDs retorna o CONJUNTO FECHADO de produtos de compra
// única indisponíveis para o usuário:
//   - base: coffees e combos já consumidos/travados (consumed_items);
//   - combo consumido -> coffees dentro dele ficam indisponíveis;
//   - coffee consumido -> todo combo que o contenha fica indisponível;
//   - repete até fixar (um combo pode conter vários coffees, e esses coffees
//     podem estar em outros combos).
//
// Kits nunca entram no conjunto (não são compra única).
func (s *saleService) getUnavailableProductIDs(userNumber uint) ([]uint, error) {
	base, err := s.saleRepo.GetConsumedProductIDs(userNumber)
	if err != nil {
		return nil, err
	}

	set := make(map[uint]struct{}, len(base))
	for _, id := range base {
		set[id] = struct{}{}
	}

	for {
		ids := make([]uint, 0, len(set))
		for id := range set {
			ids = append(ids, id)
		}

		added := false

		// combo(s) no conjunto -> coffees dentro deles
		coffees, err := s.saleRepo.GetCoffeeIDsInCombos(ids)
		if err != nil {
			return nil, err
		}
		for _, id := range coffees {
			if _, ok := set[id]; !ok {
				set[id] = struct{}{}
				added = true
			}
		}

		// coffee(s) no conjunto -> combos que os contêm
		combos, err := s.saleRepo.GetComboIDsContainingCoffee(ids)
		if err != nil {
			return nil, err
		}
		for _, id := range combos {
			if _, ok := set[id]; !ok {
				set[id] = struct{}{}
				added = true
			}
		}

		if !added {
			break
		}
	}

	result := make([]uint, 0, len(set))
	for id := range set {
		result = append(result, id)
	}
	return result, nil
}

// syncConsumptionForSale alinha as travas de compra única de uma venda com o
// status atual dela. Requer que Items.Product (e ComboItems, se necessário)
// estejam preloadados — o GetByID do repositório já faz isso.
func (s *saleService) syncConsumptionForSale(saleID uint) error {
	sale, err := s.saleRepo.GetByID(saleID)
	if err != nil {
		return err
	}

	// Pedidos ativos mantêm (ou reforçam, de forma idempotente) as travas.
	if sale.Status == SaleStatusPending || sale.Status == SaleStatusPaid {
		var ids []uint
		for _, item := range sale.Items {
			if item.Product == nil {
				continue
			}
			if item.Product.Type == product.ProductTypeCoffee || item.Product.Type == product.ProductTypeCombo {
				ids = append(ids, item.Product.ID)
			}
		}
		if len(ids) == 0 {
			return nil
		}
		return s.saleRepo.UpsertConsumed(sale.SaleUserNumber, sale.ID, ids)
	}

	// Status final (EXPIRADO/CANCELADO/REEMBOLSADO/REJEITADO): libera.
	return s.saleRepo.DeleteConsumedBySale(sale.ID)
}

// GetConsumed expõe ao front o conjunto fechado de produtos indisponíveis para
// o usuário (o mesmo usado pelo CreateSale para rejeitar compras duplicadas).
func (s *saleService) GetConsumed(userNumber uint) ([]uint, error) {
	return s.getUnavailableProductIDs(userNumber)
}
