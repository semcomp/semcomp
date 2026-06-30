package section

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SectionHandler struct {
	sectionService SectionService
}

func NewSectionHandler(sectionService SectionService) *SectionHandler {
	return &SectionHandler{sectionService: sectionService}
}

// CreateSection processa o payload JSON e tenta criar uma nova seção.
// @Summary Cria uma nova seção
// @Description Cadastra uma seção no sistema
// @Tags Section Backoffice
// @Accept json
// @Produce json
// @Param request body section.CreateSectionRequest true "Dados da seção"
// @Success 201 {object} map[string]interface{} "Seção criada com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/sections [post]
func (h *SectionHandler) CreateSection(c *gin.Context) {
	var request CreateSectionRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	section, err := h.sectionService.CreateSection(request)
	if err != nil {
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Seção criada com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Seção criada com sucesso!", "section": section})
}

// GetSectionByName retorna uma seção específica buscando pelo nome.
// @Summary Busca seção por nome
// @Description Retorna os dados de uma seção específica
// @Tags Section Backoffice
// @Accept json
// @Produce json
// @Param sectionName path string true "Nome da seção"
// @Success 200 {object} section.Section "Seção encontrada"
// @Failure 404 {object} map[string]string "Seção não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/sections/{sectionName} [get]
func (h *SectionHandler) GetSectionByName(c *gin.Context) {
	name := c.Param("sectionName")

	section, err := h.sectionService.GetSectionByName(name)
	if err != nil {
		if errors.Is(err, ErrSectionNotFound) {
			c.Set("responseMessage", "Seção não encontrada")
			c.JSON(http.StatusNotFound, gin.H{"error": "Seção não encontrada"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Seção encontrada com sucesso!")
	c.JSON(http.StatusOK, section)
}

// DeleteSectionByName remove uma seção identificada pelo nome.
// @Summary Deleta seção
// @Description Remove uma seção do sistema
// @Tags Section Backoffice
// @Accept json
// @Produce json
// @Param sectionName path string true "Nome da seção"
// @Success 200 {object} map[string]string "Seção removida com sucesso"
// @Failure 404 {object} map[string]string "Seção não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/sections/{sectionName} [delete]
func (h *SectionHandler) DeleteSectionByName(c *gin.Context) {
	name := c.Param("sectionName")

	err := h.sectionService.DeleteSectionByName(name)
	if err != nil {
		if errors.Is(err, ErrSectionNotFound) {
			c.Set("responseMessage", "Seção não encontrada")
			c.JSON(http.StatusNotFound, gin.H{"error": "Seção não encontrada"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Seção removida com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Seção removida com sucesso!"})
}

// UpdateSectionByName atualiza os dados de uma seção existente.
// @Summary Atualiza seção
// @Description Altera os dados de uma seção existente
// @Tags Section Backoffice
// @Accept json
// @Produce json
// @Param sectionName path string true "Nome da seção"
// @Param request body section.UpdateSectionRequest true "Dados para atualização"
// @Success 200 {object} map[string]interface{} "Seção atualizada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Seção não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/sections/{sectionName} [put]
func (h *SectionHandler) UpdateSectionByName(c *gin.Context) {
	name := c.Param("sectionName")

	var request UpdateSectionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	section, err := h.sectionService.UpdateSectionByName(name, request)
	if err != nil {
		if errors.Is(err, ErrSectionNotFound) {
			c.Set("responseMessage", "Seção não encontrada")
			c.JSON(http.StatusNotFound, gin.H{"error": "Seção não encontrada"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Seção atualizada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Seção atualizada com sucesso!", "section": section})
}

// GetSections retorna a lista paginada de seções com suporte a filtros e ordenação.
// @Summary Lista seções
// @Description Retorna uma lista paginada de seções cadastradas
// @Tags Section Backoffice
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(name)
// @Param sort_order query string false "Ordem (asc/desc)" default(asc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de seções paginada"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/sections [get]
func (h *SectionHandler) GetSections(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "name")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	if pageQuery := c.Query("page"); pageQuery != "" {
		parsedPage, err := strconv.Atoi(pageQuery)
		if err != nil {
			c.Set("responseMessage", "Parâmetro 'page' inválido")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'page' inválido"})
			return
		}
		page = parsedPage
	}

	if limitQuery := c.Query("limit"); limitQuery != "" {
		parsedLimit, err := strconv.Atoi(limitQuery)
		if err != nil {
			c.Set("responseMessage", "Parâmetro 'limit' inválido")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'limit' inválido"})
			return
		}
		limit = parsedLimit
	}

	result, err := h.sectionService.GetSections(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.Set("responseMessage", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Set("responseMessage", "Seções listadas com sucesso!")
	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"sections":         result.Sections,
	})
}
