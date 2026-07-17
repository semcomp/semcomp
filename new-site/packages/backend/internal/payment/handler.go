package payment

import (
	"backend/internal/apierrors"
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
	userNumber := c.GetUint("userNumber")

	var req CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}
	req.UserNumber = userNumber

	initPoint, err := h.service.CreatePreference(req)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"init_point": initPoint})
}

// POST /webhook/mercadopago — público, chamado pelo MP.
func (h *PaymentHandler) Webhook(c *gin.Context) {
	dataID := c.Query("data.id")
	if dataID == "" {
		var payload WebhookPayload
		if err := c.ShouldBindJSON(&payload); err == nil {
			dataID = payload.Data.ID
		}
	}

	xSignature := c.GetHeader("x-signature")
	xRequestID := c.GetHeader("x-request-id")

	if err := h.service.HandleWebhook(dataID, xSignature, xRequestID); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	// Sempre responder 200 rapidamente para o MP não ficar reenviando
	// em caso de erros já tratados
	c.JSON(http.StatusOK, gin.H{"message": "OK"})
}

// GET /api/payments — lista pagamentos do usuário logado
func (h *PaymentHandler) ListByUser(c *gin.Context) {
	userNumber := c.GetUint("userNumber")

	payments, err := h.service.GetByUser(userNumber)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.NotFoundError("Pagamentos não encontrados", err))
		return
	}

	c.JSON(http.StatusOK, payments)
}
