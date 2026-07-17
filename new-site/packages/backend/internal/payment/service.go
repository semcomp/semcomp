package payment

import (
	"backend/internal/apierrors"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

type PaymentService interface {
	CreatePreference(req CreatePaymentRequest) (string, error)
	HandleWebhook(dataID, xSignature, xRequestID string) error
	GetByUser(userNumber uint) ([]Payment, error)
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

// Cria uma preferência de pagamento no Mercado Pago
func (s *paymentService) CreatePreference(req CreatePaymentRequest) (string, error) {
	// Salva o pagamento como "pending" ANTES de chamar o MP
	payment := &Payment{
		UserNumber: req.UserNumber,
		Status:     "pending",
		Amount:     req.Amount,
	}
	if err := s.repo.Create(payment); err != nil {
		return "", apierrors.InternalServerError("Erro ao salvar pagamento pendente", err)
	}

	token := os.Getenv("MERCADOPAGO_ACCESS_TOKEN")
	if token == "" {
		return "", apierrors.InternalServerError("MERCADOPAGO_ACCESS_TOKEN não configurado", nil)
	}

	body := map[string]interface{}{
		"items": []map[string]interface{}{
			{
				"title":       req.Description,
				"quantity":    1,
				"unit_price":  req.Amount,
				"currency_id": "BRL",
			},
		},
		"external_reference": fmt.Sprintf("payment-%d", payment.ID_Payment),
		"back_urls": map[string]string{
			"success": os.Getenv("FRONTEND_URL") + "/payment/success",
			"failure": os.Getenv("FRONTEND_URL") + "/payment/failure",
		},
		"notification_url": os.Getenv("BACKEND_URL") + "/webhook/mercadopago",
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", apierrors.InternalServerError("Erro ao montar corpo da requisição", err)
	}

	httpReq, err := http.NewRequest("POST", "https://api.mercadopago.com/checkout/preferences", strings.NewReader(string(jsonBody)))
	if err != nil {
		return "", apierrors.InternalServerError("Erro ao montar requisição ao Mercado Pago", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return "", apierrors.InternalServerError("Erro ao criar preferência de pagamento", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", apierrors.InternalServerError("Erro ao decodificar resposta do Mercado Pago", err)
	}

	if resp.StatusCode >= 400 {
		return "", apierrors.InternalServerError(
			fmt.Sprintf("Mercado Pago retornou erro (status %d): %v", resp.StatusCode, result),
			nil,
		)
	}

	initPoint, ok := result["init_point"].(string)
	if !ok {
		return "", apierrors.InternalServerError("Resposta do Mercado Pago sem init_point", nil)
	}

	return initPoint, nil
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
