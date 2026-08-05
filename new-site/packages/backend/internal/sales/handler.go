package sales

import (
	"fmt"
	"net/http"
	"strconv"

	"backend/internal/apierrors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type SaleHandler struct {
	saleService SaleService
}

func NewSaleHandler(saleService SaleService) *SaleHandler {
	return &SaleHandler{saleService: saleService}
}

// CreateSale cria um novo pedido de compra.
// @Summary Cria uma nova venda
// @Description Realiza o fechamento do pedido (carrinho)
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

	var request CreateSaleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("Valor inválido para o campo '%s'", validationErrs[0].Field()), err))
			return
		}
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	sale, err := h.saleService.CreateSale(userNumber, request)
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

// UpdateItemPickup atualiza o status de retirada de um item específico
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