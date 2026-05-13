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

func (h *SectionHandler) CreateSection(c *gin.Context) {
	var request CreateSectionRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados da requisição inválidos"})
		return
	}

	section, err := h.sectionService.CreateSection(request)
	if err != nil {
    c.Set("internalError", err)
		c.Set("responseMessage", "Erro na criação de seção")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar seção"})
		return
	}
	c.Set("responseMessage", "Seção criada com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Seção criada com sucesso!", "section": section})
}

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
		c.Set("responseMessage", "Erro na busca de seção")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter seção"})
		return
	}
	c.Set("responseMessage", "Seção encontrada com sucesso!")
	c.JSON(http.StatusOK, section)
}

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
		c.Set("responseMessage", "Erro na remoção da seção")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover seção"})
		return
	}
	c.Set("responseMessage", "Seção removida com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Seção removida com sucesso!"})
}

func (h *SectionHandler) UpdateSectionByName(c *gin.Context) {
	name := c.Param("sectionName")

	var request UpdateSectionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados da requisição inválidos"})
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
		c.Set("responseMessage", "Erro na atualização da seção")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar seção"})
		return
	}
	c.Set("responseMessage", "Seção atualizada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Seção atualizada com sucesso!", "section": section})
}

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
		c.Set("responseMessage", "Erro ao listar as seções")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados da requisição inválidos"})
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
