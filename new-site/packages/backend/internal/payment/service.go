package payment

import (
	"backend/internal/apierrors"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type PaymentService interface {
	CreatePreference(req CreatePaymentRequest) (string, error) // retorna init_point (URL de pagamento)
	HandleWebhook(payload WebhookPayload) error
	GetByUser(userNumber uint) ([]Payment, error)
}

type paymentService struct {
	repo PaymentRepository
}

func NewPaymentService(repo PaymentRepository) PaymentService {
	return &paymentService{repo: repo}
}

// Cria uma preferência de pagamento no Mercado Pago
func (s *paymentService) CreatePreference(req CreatePaymentRequest) (string, error) {
	token := os.Getenv("MERCADOPAGO_ACCESS_TOKEN")

	body := map[string]interface{}{
		"items": []map[string]interface{}{
			{
				"title":       req.Description,
				"quantity":    1,
				"unit_price":  req.Amount,
				"currency_id": "BRL",
			},
		},
		"external_reference": fmt.Sprintf("user-%d", req.UserNumber),
		"back_urls": map[string]string{
			"success": os.Getenv("FRONTEND_URL") + "/payment/success",
			"failure": os.Getenv("FRONTEND_URL") + "/payment/failure",
		},
		"notification_url": os.Getenv("BACKEND_URL") + "/webhook/mercadopago",
	}

	jsonBody, _ := json.Marshal(body)
	httpReq, _ := http.NewRequest("POST", "https://api.mercadopago.com/checkout/preferences", strings.NewReader(string(jsonBody)))
	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return "", apierrors.InternalServerError("Erro ao criar preferência de pagamento", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Salva o pagamento como "pending" no banco
	s.repo.Create(&Payment{
		UserNumber: req.UserNumber,
		Status:     "pending",
		Amount:     req.Amount,
	})

	return result["init_point"].(string), nil
}

// Recebe notificação do MP e atualiza status
func (s *paymentService) HandleWebhook(payload WebhookPayload) error {
	if payload.Action != "payment.updated" && payload.Action != "payment.created" {
		return nil
	}

	token := os.Getenv("MERCADOPAGO_ACCESS_TOKEN")
	url := fmt.Sprintf("https://api.mercadopago.com/v1/payments/%s", payload.Data.ID)

	httpReq, _ := http.NewRequest("GET", url, nil)
	httpReq.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return apierrors.InternalServerError("Erro ao processar webhook", err)
	}
	defer resp.Body.Close()

	var mpPayment map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&mpPayment)

	status := mpPayment["status"].(string)
	mpID := payload.Data.ID

	return s.repo.UpdateStatus(mpID, status)
}

func (s *paymentService) GetByUser(userNumber uint) ([]Payment, error) {
	return s.repo.FindByUser(userNumber)
}
