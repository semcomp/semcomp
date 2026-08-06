package payment

import (
	"backend/internal/apierrors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	service PaymentService
}

func NewPaymentHandler(s PaymentService) *PaymentHandler {
	return &PaymentHandler{service: s}
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

// POST /api/payments/pix — cria pagamento PIX e retorna QR code
func (h *PaymentHandler) CreatePix(c *gin.Context) {
	userNumber := c.GetUint("userNumber")
	email := c.GetString("email")

	var req CreatePixRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	resp, err := h.service.CreatePix(userNumber, email, req)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// GET /api/payments/:id/status — retorna status atual do pagamento (para polling)
func (h *PaymentHandler) GetStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID de pagamento inválido", err))
		return
	}

	status, err := h.service.GetStatus(uint(id))
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": status})
}
