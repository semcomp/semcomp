package sales

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"
	"backend/internal/product"
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

	// GetStatus retorna o status efetivo de uma venda, considerando expiração
	// de PIX pendente (antigo PaymentService.GetStatus, usado para polling).
	GetStatus(saleID uint) (string, error)

	GetSaleByID(userNumber uint, saleID uint) (*Sale, error)
	GetUserSales(userNumber uint) ([]Sale, error)
	GetAllSales(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SaleListResult, error)
	UpdateSaleByID(id string, request UpdateSaleRequest) (*Sale, error)
	DeleteSaleByID(id string) error

	// Operação de Item (Backoffice)
	UpdateItemPickup(itemID string, request UpdateSaleItemPickupRequest) (*SaleItem, error)
}

type saleService struct {
	saleRepo    SaleRepository
	productRepo product.ProductRepository
	httpClient  *http.Client
}

func NewSaleService(saleRepo SaleRepository, productRepo product.ProductRepository) SaleService {
	return &saleService{
		saleRepo:    saleRepo,
		productRepo: productRepo,
		httpClient:  &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *saleService) CreateSale(userNumber uint, email string, request CreateSaleRequest) (*Sale, error) {
	var totalAmount float64
	var saleItems []SaleItem

	for _, itemReq := range request.Items {
		prod, err := s.productRepo.GetByID(itemReq.ProductID)
		if err != nil {
			return nil, apierrors.ValidationError("O produto com ID "+strconv.Itoa(int(itemReq.ProductID))+" não foi encontrado", err)
		}

		if !prod.IsSelling {
			return nil, apierrors.ValidationError("O produto '"+strconv.Itoa(int(prod.ID))+"' não está mais disponível para venda", nil)
		}

		unitPrice := prod.Price
		quantity := itemReq.Quantity
		totalAmount += unitPrice * float64(quantity)

		saleItems = append(saleItems, SaleItem{
			ProductID:  prod.ID,
			Quantity:   quantity,
			UnitPrice:  unitPrice,
			IsPickedUp: false, // Default na criação do pedido
		})
	}

	status := request.Status
	if status == "" {
		status = SaleStatusPending
	}

	newSale := Sale{
		SaleUserNumber:          userNumber,
		Status:              status,
		PaymentMethod:       request.PaymentMethod,
		TotalAmount:         totalAmount,
		Items:               saleItems,
		DietaryRestrictions: request.DietaryRestrictions,
	}

	if err := s.saleRepo.Create(&newSale); err != nil {
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

	return s.saleRepo.UpdateByID(existing.ID, updateData)
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
func (s *saleService) GetStatus(saleID uint) (string, error) {
	sale, err := s.saleRepo.GetByID(saleID)
	if err != nil {
		return "", err
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
	if request.DietaryRestrictions != "" {
		updateData["dietary_restrictions"] = request.DietaryRestrictions
	}

	if len(updateData) > 0 {
		err = s.saleRepo.UpdateByID(uint(parsedID), updateData)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, apierrors.NotFoundError("Venda não encontrada", err)
			}
			return nil, apierrors.InternalServerError("Erro ao atualizar venda", err)
		}
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