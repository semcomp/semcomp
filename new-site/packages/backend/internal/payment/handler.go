package payment

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	service PaymentService
}

func NewPaymentHandler(s PaymentService) *PaymentHandler {
	return &PaymentHandler{service: s}
}

// POST /api/payments — cria preferência (usuário autenticado)
func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	userNumber := c.GetUint("userNumber") // injetado pelo AuthMiddleware

	var req CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.UserNumber = userNumber

	initPoint, err := h.service.CreatePreference(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar pagamento"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"init_point": initPoint})
}

// POST /webhook/mercadopago — público, chamado pelo MP
func (h *PaymentHandler) Webhook(c *gin.Context) {
	var payload WebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.HandleWebhook(payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar webhook"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OK"})
}

// GET /api/payments — lista pagamentos do usuário logado
func (h *PaymentHandler) ListByUser(c *gin.Context) {
	userNumber := c.GetUint("userNumber")

	payments, err := h.service.GetByUser(userNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar pagamentos"})
		return
	}

	c.JSON(http.StatusOK, payments)
}
