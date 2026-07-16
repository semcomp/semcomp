package product

import (
	"backend/internal/apierrors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService ProductService
}

func NewProductHandler(productService ProductService) *ProductHandler {
	return &ProductHandler{productService: productService}
}

// CreateProduct processa o payload JSON e tenta criar um novo produto.
// @Summary Cria um novo produto
// @Description Cadastra um produto no sistema (kit, coffee ou combo)
// @Tags Product Backoffice
// @Accept json
// @Produce json
// @Param request body product.CreateProductRequest true "Dados do produto"
// @Success 201 {object} map[string]interface{} "Produto criado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var request CreateProductRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	product, err := h.productService.CreateProduct(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Produto criado com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Produto criado com sucesso!", "product": product})
}

// GetProductByID retorna um produto específico buscando pelo ID.
// @Summary Busca produto por ID
// @Description Retorna os dados de um produto específico, incluindo sua especialização
// @Tags Product Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do produto"
// @Success 200 {object} product.Product "Produto encontrado"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Produto não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/products/{id} [get]
func (h *ProductHandler) GetProductByID(c *gin.Context) {
	id := c.Param("id")

	product, err := h.productService.GetProductByID(id)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Produto encontrado com sucesso!")
	c.JSON(http.StatusOK, product)
}

// DeleteProductByID remove um produto identificado pelo ID.
// @Summary Deleta produto
// @Description Remove um produto do sistema (bloqueado se for item de um combo)
// @Tags Product Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do produto"
// @Success 200 {object} map[string]string "Produto removido com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Produto não encontrado"
// @Failure 409 {object} map[string]string "Produto referenciado em combo"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/products/{id} [delete]
func (h *ProductHandler) DeleteProductByID(c *gin.Context) {
	id := c.Param("id")

	err := h.productService.DeleteProductByID(id)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Produto removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Produto removido com sucesso!"})
}

// UpdateProductByID atualiza os dados de um produto existente.
// @Summary Atualiza produto
// @Description Altera os dados de um produto existente, incluindo sua especialização
// @Tags Product Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do produto"
// @Param request body product.UpdateProductRequest true "Dados para atualização"
// @Success 200 {object} map[string]interface{} "Produto atualizado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Produto não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/products/{id} [put]
func (h *ProductHandler) UpdateProductByID(c *gin.Context) {
	id := c.Param("id")

	var request UpdateProductRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	product, err := h.productService.UpdateProductByID(id, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Produto atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Produto atualizado com sucesso!", "product": product})
}

// GetProducts retorna a lista paginada de produtos com suporte a filtros e ordenação.
// @Summary Lista produtos
// @Description Retorna uma lista paginada de produtos cadastrados
// @Tags Product Backoffice
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(id)
// @Param sort_order query string false "Ordem (asc/desc)" default(asc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de produtos paginada"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/products [get]
func (h *ProductHandler) GetProducts(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "id")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	if pageQuery := c.Query("page"); pageQuery != "" {
		parsedPage, err := strconv.Atoi(pageQuery)
		if err != nil {
			apierrors.HandleAPIError(c, apierrors.ValidationError("Parâmetro 'page' inválido", err))
			return
		}
		page = parsedPage
	}

	if limitQuery := c.Query("limit"); limitQuery != "" {
		parsedLimit, err := strconv.Atoi(limitQuery)
		if err != nil {
			apierrors.HandleAPIError(c, apierrors.ValidationError("Parâmetro 'limit' inválido", err))
			return
		}
		limit = parsedLimit
	}

	result, err := h.productService.GetProducts(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Produtos listados com sucesso!")
	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"products":         result.Products,
	})
}
