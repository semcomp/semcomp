package sales

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func isTerminalStatus(s string) bool {
	switch SaleStatus(s) {
	case SaleStatusPaid, SaleStatusRejected, SaleStatusCanceled, SaleStatusRefunded, SaleStatusExpired:
		return true
	}
	return false
}

type SaleHandler struct {
	saleService SaleService
}

func NewSaleHandler(saleService SaleService) *SaleHandler {
	return &SaleHandler{saleService: saleService}
}

// Webhook recebe as notificações do Mercado Pago.
// POST /webhook/mercadopago — público, chamado pelo MP.
func (h *SaleHandler) Webhook(c *gin.Context) {
	dataID := c.Query("data.id")
	if dataID == "" {
		var payload WebhookPayload
		if err := c.ShouldBindJSON(&payload); err == nil {
			dataID = payload.Data.ID
		}
	}

	xSignature := c.GetHeader("x-signature")
	xRequestID := c.GetHeader("x-request-id")

	if err := h.saleService.HandleWebhook(dataID, xSignature, xRequestID); err != nil {
		var apiErr *apierrors.APIError
		if errors.As(err, &apiErr) && apiErr.Status >= 400 && apiErr.Status < 500 {
			// Erro permanente (assinatura inválida, venda não encontrada, etc.):
			// responde 200 para o MP não reenviar — retry nunca vai resolver.
			log.Printf("[webhook] erro permanente, descartando reenvio: %v", err)
			c.JSON(http.StatusOK, gin.H{"message": "error handled"})
		} else {
			// Erro transitório (banco fora do ar, falha de rede com o MP, etc.):
			// responde 500 para o MP retentar com backoff exponencial.
			log.Printf("[webhook] erro transitório, permitindo reenvio: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "retry"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OK"})
}

// CreateSale cria um novo pedido de compra e, quando payment_method == "pix",
// já retorna o QR code da cobrança gerada no Mercado Pago.
// @Summary Cria uma nova venda
// @Description Realiza o fechamento do pedido (carrinho); se payment_method
// @Description for "pix", a resposta inclui qr_code/qr_code_base64/pix_expiration.
// @Tags Vendas
// @Accept json
// @Produce json
// @Param request body sales.CreateSaleRequest true "Dados do pedido"
// @Success 201 {object} map[string]interface{} "Pedido criado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Não autorizado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /sales [post]
func (h *SaleHandler) CreateSale(c *gin.Context) {
	userNumber := c.GetUint("userNumber")
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}
	email := c.GetString("email")

	var request CreateSaleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("Valor inválido para o campo '%s'", validationErrs[0].Field()), err))
			return
		}
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	sale, err := h.saleService.CreateSale(userNumber, email, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Pedido criado com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Pedido criado com sucesso!", "sale": sale})
}

// GetMySales retorna o histórico de compras do usuário.
// @Summary Histórico de vendas do usuário
// @Description Retorna todos os pedidos feitos pelo usuário autenticado
// @Tags Vendas
// @Produce json
// @Success 200 {object} map[string]interface{} "Histórico recuperado"
// @Failure 401 {object} map[string]string "Não autorizado"
// @Security BearerAuth
// @Router /sales/me [get]
func (h *SaleHandler) GetMySales(c *gin.Context) {
	userNumber := c.GetUint("userNumber")
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	sales, err := h.saleService.GetUserSales(userNumber)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"sales": sales})
}

// GetConsumed retorna os ids dos produtos de compra única (COFFEE/COMBO)
// indisponíveis para o usuário autenticado — consumidos ou travados por pedido
// ativo, incluindo o fechamento via combos.
// @Summary Produtos consumidos do usuário
// @Description Retorna os ids dos produtos de compra única que não podem mais
// @Description ser comprados pelo usuário (coffees e combos consumidos/reservados).
// @Tags Vendas
// @Produce json
// @Success 200 {object} map[string]interface{} "Lista de ids consumidos"
// @Failure 401 {object} map[string]string "Não autorizado"
// @Security BearerAuth
// @Router /sales/consumed [get]
func (h *SaleHandler) GetConsumed(c *gin.Context) {
	userNumber := c.GetUint("userNumber")
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	ids, err := h.saleService.GetConsumed(userNumber)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"product_ids": ids})
}

// GetSaleByID busca os detalhes de uma venda específica do usuário.
// @Summary Detalhes da venda
// @Description Retorna dados de um pedido específico
// @Tags Vendas
// @Produce json
// @Param id path int true "ID da venda"
// @Success 200 {object} sales.Sale "Detalhes recuperados"
// @Failure 401 {object} map[string]string "Não autorizado"
// @Failure 404 {object} map[string]string "Não encontrado"
// @Security BearerAuth
// @Router /sales/{id} [get]
func (h *SaleHandler) GetSaleByID(c *gin.Context) {
	userNumber := c.GetUint("userNumber")
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	saleID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	sale, err := h.saleService.GetSaleByID(userNumber, uint(saleID))
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, sale)
}

// GetSaleStatus retorna o status atual da venda (para polling do PIX).
// @Summary Status da venda (polling)
// @Description Retorna o status atual de uma venda, considerando expiração de PIX pendente
// @Tags Vendas
// @Produce json
// @Param id path int true "ID da venda"
// @Success 200 {object} map[string]string "Status atual"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Não encontrado"
// @Security BearerAuth
// @Router /sales/{id}/status [get]
func (h *SaleHandler) GetSaleStatus(c *gin.Context) {
	userNumber := c.GetUint("userNumber")
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID de venda inválido", err))
		return
	}

	status, err := h.saleService.GetStatus(userNumber, uint(id))
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": status})
}

// StreamSaleStatus abre uma conexão SSE que empurra atualizações de status
// do PIX em tempo real, eliminando a necessidade de polling pelo cliente.
// GET /api/sales/:id/events
func (h *SaleHandler) StreamSaleStatus(c *gin.Context) {
	userNumber := c.GetUint("userNumber")
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID de venda inválido", err))
		return
	}

	currentStatus, err := h.saleService.GetStatus(userNumber, uint(id))
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		apierrors.HandleAPIError(c, apierrors.InternalServerError("Streaming não suportado", nil))
		return
	}

	fmt.Fprintf(c.Writer, "data: %s\n\n", currentStatus)
	flusher.Flush()

	if isTerminalStatus(currentStatus) {
		return
	}

	ch := Hub.Subscribe(uint(id))
	defer Hub.Unsubscribe(uint(id), ch)

	for {
		select {
		case <-c.Request.Context().Done():
			return
		case newStatus := <-ch:
			fmt.Fprintf(c.Writer, "data: %s\n\n", newStatus)
			flusher.Flush()
			if isTerminalStatus(newStatus) {
				return
			}
		}
	}
}

// GetAllSales retorna a lista paginada de vendas (Backoffice).
// @Summary Lista todas as vendas (Admin)
// @Description Retorna uma lista paginada com suporte a filtros e ordenação
// @Tags Backoffice Vendas
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(created_at)
// @Param sort_order query string false "Ordem (asc/desc)" default(desc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de vendas paginada"
// @Security BearerAuth
// @Router /admin/sales [get]
func (h *SaleHandler) GetAllSales(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	if pageQuery := c.Query("page"); pageQuery != "" {
		if parsed, err := strconv.Atoi(pageQuery); err == nil {
			page = parsed
		}
	}

	if limitQuery := c.Query("limit"); limitQuery != "" {
		if parsed, err := strconv.Atoi(limitQuery); err == nil {
			limit = parsed
		}
	}

	result, err := h.saleService.GetAllSales(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"sales":            result.Sales,
	})
}

// UpdateSaleByID atualiza os dados de uma venda existente.
// @Summary Atualiza status/dados de uma venda
// @Description Altera os dados de uma venda existente (ação geralmente administrativa)
// @Tags Backoffice Vendas
// @Accept json
// @Produce json
// @Param id path string true "ID da venda"
// @Param request body sales.UpdateSaleRequest true "Dados para atualização"
// @Success 200 {object} map[string]interface{} "Venda atualizada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Venda não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/sales/{id} [put]
func (h *SaleHandler) UpdateSaleByID(c *gin.Context) {
	id := c.Param("id")

	var request UpdateSaleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	sale, err := h.saleService.UpdateSaleByID(id, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Venda atualizada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Venda atualizada com sucesso!", "sale": sale})
}

// DeleteSaleByID remove uma venda identificada pelo ID.
// @Summary Deleta uma venda
// @Description Remove permanentemente uma venda do sistema e seus itens
// @Tags Backoffice Vendas
// @Produce json
// @Param id path string true "ID da venda"
// @Success 200 {object} map[string]string "Venda removida com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Venda não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/sales/{id} [delete]
func (h *SaleHandler) DeleteSaleByID(c *gin.Context) {
	id := c.Param("id")

	err := h.saleService.DeleteSaleByID(id)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Venda removida com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Venda removida com sucesso!"})
}

// UpdateItemPickup atualiza o status de retirada de um item específico.
// @Summary Atualiza o status de retirada de um item da venda
// @Description Marca um produto (ex: Kit) como retirado ou não pelo participante
// @Tags Backoffice Vendas
// @Accept json
// @Produce json
// @Param itemId path string true "ID do item da venda (SaleItem)"
// @Param request body sales.UpdateSaleItemPickupRequest true "Status de retirada"
// @Success 200 {object} map[string]interface{} "Status atualizado"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Item não encontrado"
// @Security BearerAuth
// @Router /admin/sales/items/{itemId}/pickup [patch]
func (h *SaleHandler) UpdateItemPickup(c *gin.Context) {
	itemID := c.Param("itemId")

	var req UpdateSaleItemPickupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	item, err := h.saleService.UpdateItemPickup(itemID, req)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Status de retirada do item atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Status atualizado com sucesso!", "item": item})
}

// VerifyCoffeeAccess verifica se o usuário possui compra PAGA para o coffee do horário informado
// @Summary Verifica acesso ao coffee
// @Description Verifica se o usuário (via QR code) possui venda PAGA para o coffee do date_time informado (considera também combos que contêm o coffee)
// @Tags Coffee Backoffice
// @Produce json
// @Param userNumber path string true "Número do usuário (ex: 123)"
// @Param dateTime path string true "Horário do coffee em RFC3339 (ex: 2026-08-01T09:00:00Z)"
// @Success 200 {object} map[string]interface{} "Resultado da verificação"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 404 {object} map[string]string "Coffee não encontrado"
// @Security BearerAuth
// @Router /admin/coffees/verify/{userNumber}/{dateTime} [get]
func (h *SaleHandler) VerifyCoffeeAccess(c *gin.Context) {
	userNumberStr := c.Param("userNumber")
	if userNumberStr == "" {
		userNumberStr = c.Query("user_number")
	}
	dateTime := c.Param("dateTime")
	if dateTime == "" {
		dateTime = c.Query("date_time")
	}
	if dateTime == "" {
		dateTime = c.Query("dateTime")
	}
	if userNumberStr == "" || dateTime == "" {
		apierrors.HandleAPIError(c, apierrors.ValidationError("user_number e date_time são obrigatórios", nil))
		return
	}
	userNumber, err := strconv.ParseUint(userNumberStr, 10, 64)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("user_number inválido", err))
		return
	}
	hasAccess, err := h.saleService.VerifyCoffeeAccess(uint(userNumber), dateTime)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Verificação de acesso ao coffee concluída")
	c.JSON(http.StatusOK, gin.H{
		"user_number": userNumber,
		"date_time":   dateTime,
		"has_access":  hasAccess,
	})
}
