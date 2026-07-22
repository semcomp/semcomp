package payment

import (
	"backend/internal/apierrors"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

type PaymentService interface {
	CreatePix(userNumber uint, email string, req CreatePixRequest) (*PixPaymentResponse, error)
	HandleWebhook(dataID, xSignature, xRequestID string) error
	GetByUser(userNumber uint) ([]Payment, error)
	GetStatus(paymentID uint) (string, error)
}

type paymentService struct {
	repo       PaymentRepository
	httpClient *http.Client
}

func NewPaymentService(repo PaymentRepository) PaymentService {
	return &paymentService{
		repo:       repo,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// HandleWebhook valida a assinatura, busca o pagamento real na API do MP
// e atualiza o status pelo external_reference (nosso ID interno).
func (s *paymentService) HandleWebhook(dataID, xSignature, xRequestID string) error {
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

	status, ok := mpPayment["status"].(string)
	if !ok {
		return apierrors.InternalServerError("Resposta do Mercado Pago sem status válido", nil)
	}

	externalRef, ok := mpPayment["external_reference"].(string)
	if !ok || !strings.HasPrefix(externalRef, "payment-") {
		return apierrors.InternalServerError("external_reference ausente ou inválido no pagamento do MP", nil)
	}

	paymentID, err := strconv.ParseUint(strings.TrimPrefix(externalRef, "payment-"), 10, 64)
	if err != nil {
		return apierrors.InternalServerError("Não foi possível extrair o ID interno do external_reference", err)
	}

	existing, err := s.repo.FindByID(uint(paymentID))
	if err != nil {
		return apierrors.NotFoundError("Payment interno não encontrado para esse webhook", err)
	}

	// Reconciliação de valor: alerta se o valor do MP não bate com o registrado.
	if amount, ok := mpPayment["transaction_amount"].(float64); ok {
		if amount != existing.Amount {
			fmt.Printf("[ALERTA] divergência de valor no payment %d: esperado %.2f, recebido %.2f\n",
				existing.ID_Payment, existing.Amount, amount)
		}
	}

	if existing.Status == status {
		return nil
	}

	// Grava o MercadoPagoID na primeira vez que soubermos dele.
	if existing.MercadoPagoID == nil {
		if err := s.repo.SetMercadoPagoID(existing.ID_Payment, dataID); err != nil {
			return apierrors.InternalServerError("Erro ao salvar mercado_pago_id", err)
		}
	}

	return s.repo.UpdateStatus(existing.ID_Payment, status)
}

// verifySignature confere a assinatura enviada pelo Mercado Pago
// usando o secret configurado no painel de webhooks.
// Formato do header: "ts=1234567890,v1=abcdef..."
// Manifest assinado: "id:{data.id};request-id:{x-request-id};ts:{ts};"
func (s *paymentService) verifySignature(dataID, xSignature, xRequestID string) error {
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

func (s *paymentService) GetByUser(userNumber uint) ([]Payment, error) {
	return s.repo.FindByUser(userNumber)
}

func (s *paymentService) CreatePix(userNumber uint, email string, req CreatePixRequest) (*PixPaymentResponse, error) {
	payment := &Payment{
		UserNumber: userNumber,
		Status:     "pending",
		Amount:     req.Amount,
	}
	if err := s.repo.Create(payment); err != nil {
		return nil, apierrors.InternalServerError("Erro ao salvar pagamento pendente", err)
	}

	token := os.Getenv("MERCADOPAGO_ACCESS_TOKEN")
	if token == "" {
		return nil, apierrors.InternalServerError("MERCADOPAGO_ACCESS_TOKEN não configurado", nil)
	}

	description := req.Description
	if description == "" {
		description = "Semcomp - Compra de produtos"
	}

	body := map[string]interface{}{
		"transaction_amount":  req.Amount,
		"description":        description,
		"payment_method_id":  "pix",
		"external_reference": fmt.Sprintf("payment-%d", payment.ID_Payment),
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
		return nil, apierrors.InternalServerError("Erro ao montar requisição PIX", err)
	}

	httpReq, err := http.NewRequest("POST", "https://api.mercadopago.com/v1/payments", strings.NewReader(string(jsonBody)))
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao montar requisição ao Mercado Pago", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Idempotency-Key", fmt.Sprintf("pix-%d-%d", userNumber, payment.ID_Payment))

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar pagamento PIX", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, apierrors.InternalServerError("Erro ao decodificar resposta do Mercado Pago", err)
	}

	if resp.StatusCode >= 400 {
		log.Printf("[PIX] Mercado Pago erro %d: %v", resp.StatusCode, result)
		return nil, apierrors.InternalServerError(
			fmt.Sprintf("Mercado Pago retornou erro (status %d): %v", resp.StatusCode, result),
			nil,
		)
	}

	// Grava o MP payment ID imediatamente (diferente da preference, aqui já temos o ID)
	if mpIDFloat, ok := result["id"].(float64); ok {
		mpID := fmt.Sprintf("%.0f", mpIDFloat)
		_ = s.repo.SetMercadoPagoID(payment.ID_Payment, mpID)
	}

	// Extrai QR code do payload do Mercado Pago
	var qrCode, qrCodeBase64 string
	if poi, ok := result["point_of_interaction"].(map[string]interface{}); ok {
		if txData, ok := poi["transaction_data"].(map[string]interface{}); ok {
			qrCode, _ = txData["qr_code"].(string)
			qrCodeBase64, _ = txData["qr_code_base64"].(string)
		}
	}

	// Vincula os produtos comprados ao pagamento para histórico
	if len(req.ProductIDs) > 0 {
		if err := s.repo.SetProducts(payment.ID_Payment, req.ProductIDs); err != nil {
			log.Printf("[PIX] aviso: falha ao vincular produtos ao pagamento %d: %v", payment.ID_Payment, err)
		}
	}

	return &PixPaymentResponse{
		PaymentID:    payment.ID_Payment,
		QRCode:       qrCode,
		QRCodeBase64: qrCodeBase64,
		Amount:       req.Amount,
	}, nil
}

const pixExpirationWindow = 30 * time.Minute

func (s *paymentService) GetStatus(paymentID uint) (string, error) {
	p, err := s.repo.FindByID(paymentID)
	if err != nil {
		return "", err
	}
	if p.Status == "pending" && time.Since(p.CreatedAt) > pixExpirationWindow {
		return "expired", nil
	}
	return p.Status, nil
}
