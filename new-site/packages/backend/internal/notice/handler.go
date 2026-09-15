package notice

import (
	"backend/internal/apierrors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type NoticeHandler struct {
	noticeService NoticeService
}

func NewNoticeHandler(noticeService NoticeService) *NoticeHandler {
	return &NoticeHandler{noticeService: noticeService}
}

// CreateNotice processa o payload JSON e tenta criar um novo aviso.
// @Summary Cria um novo aviso
// @Description Cadastra um aviso no mural
// @Tags Notice Backoffice
// @Accept json
// @Produce json
// @Param request body notice.CreateNoticeRequest true "Dados do aviso"
// @Success 201 {object} map[string]interface{} "Aviso criado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Security BearerAuth
// @Router /admin/notices [post]
func (h *NoticeHandler) CreateNotice(c *gin.Context) {
	var request CreateNoticeRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	notice, err := h.noticeService.CreateNotice(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Aviso criado com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Aviso criado com sucesso!", "notice": notice})
}

// GetNoticeByID retorna um aviso específico buscando pelo ID.
// @Summary Busca aviso por ID
// @Description Retorna os dados de um aviso específico
// @Tags Notice Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do aviso"
// @Success 200 {object} notice.Notice "Aviso encontrado"
// @Failure 400 {object} map[string]string "Parâmetro 'id' inválido"
// @Failure 404 {object} map[string]string "Aviso não encontrado"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Security BearerAuth
// @Router /admin/notices/{id} [get]
func (h *NoticeHandler) GetNoticeByID(c *gin.Context) {
	id := c.Param("id")

	notice, err := h.noticeService.GetNoticeByID(id)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Aviso encontrado com sucesso!")
	c.JSON(http.StatusOK, notice)
}

// DeleteNoticeByID remove um aviso identificado pelo ID.
// @Summary Deleta aviso
// @Description Remove um aviso do mural
// @Tags Notice Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do aviso"
// @Success 200 {object} map[string]string "Aviso removido com sucesso!"
// @Failure 400 {object} map[string]string "Parâmetro 'id' inválido"
// @Failure 404 {object} map[string]string "Aviso não encontrado"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Security BearerAuth
// @Router /admin/notices/{id} [delete]
func (h *NoticeHandler) DeleteNoticeByID(c *gin.Context) {
	id := c.Param("id")

	err := h.noticeService.DeleteNoticeByID(id)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Aviso removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Aviso removido com sucesso!"})
}

// UpdateNoticeByID atualiza os dados de um aviso existente.
// @Summary Atualiza aviso
// @Description Altera os dados de um aviso existente
// @Tags Notice Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do aviso"
// @Param request body notice.UpdateNoticeRequest true "Dados para atualização"
// @Success 200 {object} map[string]interface{} "Aviso atualizado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Aviso não encontrado"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Security BearerAuth
// @Router /admin/notices/{id} [put]
func (h *NoticeHandler) UpdateNoticeByID(c *gin.Context) {
	id := c.Param("id")

	var request UpdateNoticeRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	notice, err := h.noticeService.UpdateNoticeByID(id, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Aviso atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Aviso atualizado com sucesso!", "notice": notice})
}

// GetNotices retorna a lista paginada de avisos com suporte a filtros e ordenação.
// @Summary Lista avisos
// @Description Retorna uma lista paginada de avisos cadastrados no mural
// @Tags Notice Backoffice
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(date_time)
// @Param sort_order query string false "Ordem (asc/desc)" default(desc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de avisos paginada"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Security BearerAuth
// @Router /admin/notices [get]
func (h *NoticeHandler) GetNotices(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "date_time")
	sortOrder := c.DefaultQuery("sort_order", "desc")
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

	result, err := h.noticeService.GetNotices(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Avisos listados com sucesso!")
	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"notices":          result.Notices,
	})
}
