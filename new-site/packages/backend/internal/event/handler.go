package event

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type EventHandler struct {
	eventService EventService
}

func NewEventHandler(eventService EventService) *EventHandler {
	return &EventHandler{eventService: eventService}
}

// CreateEvent processa o payload JSON e tenta criar um novo evento.
// @Summary Cria um novo evento
// @Description Cadastra um evento no sistema
// @Tags Event Backoffice
// @Accept json
// @Produce json
// @Param request body event.CreateEventRequest true "Dados do evento"
// @Success 201 {object} map[string]interface{} "Evento criado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 409 {object} map[string]string "Evento já existe"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/events [post]
func (h *EventHandler) CreateEvent(c *gin.Context) {
	var request CreateEventRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	event, err := h.eventService.CreateEvent(request)
	if err != nil {

		if errors.Is(err, ErrEventConflict) {
      		c.Set("responseMessage", "Evento já existe")
			c.JSON(http.StatusConflict, gin.H{"error": "Evento já existe"})
			return
		}

		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Set("responseMessage", "Evento criado com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Evento criado com sucesso!", "event": event})
}

// GetEventByNameAndInitDate retorna um evento específico buscando pelo nome e data de início.
// @Summary Busca evento por nome e data
// @Description Retorna os dados de um evento específico
// @Tags Event Público
// @Accept json
// @Produce json
// @Param eventName path string true "Nome do evento"
// @Param initDate path string true "Data de início do evento (RFC3339)"
// @Success 200 {object} event.Event "Evento encontrado"
// @Failure 400 {object} map[string]string "Data inválida"
// @Failure 404 {object} map[string]string "Evento não encontrado"
// @Failure 409 {object} map[string]string "Evento já existe"
// @Failure 500 {object} map[string]string "Erro interno"
// @Router /event/{eventName}/{initDate} [get]
func (h *EventHandler) GetEventByNameAndInitDate(c *gin.Context) {
	name := c.Param("eventName")
	initDate := c.Param("initDate")

	event, err := h.eventService.GetEventByNameAndInitDate(name, initDate)
	if err != nil {
		if errors.Is(err, ErrEventConflict) {
			c.JSON(http.StatusConflict, gin.H{"error": "Evento já existe"})
			return
		}

		if errors.Is(err, ErrInvalidEventDate) {
			c.Set("responseMessage", "Data inválida. Use o formato RFC3339")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}

		if errors.Is(err, ErrEventNotFound) {
			c.Set("responseMessage", "Evento não encontrado")
			c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Evento encontrado com sucesso!")
	c.JSON(http.StatusOK, event)
}

// DeleteEventByNameAndInitDate remove um evento identificado pelo nome e data de início.
// @Summary Deleta evento
// @Description Remove um evento do sistema
// @Tags Event Backoffice
// @Accept json
// @Produce json
// @Param eventName path string true "Nome do evento"
// @Param initDate path string true "Data de início do evento (RFC3339)"
// @Success 200 {object} map[string]string "Evento removido com sucesso"
// @Failure 400 {object} map[string]string "Data inválida"
// @Failure 404 {object} map[string]string "Evento não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/events/{eventName}/{initDate} [delete]
func (h *EventHandler) DeleteEventByNameAndInitDate(c *gin.Context) {
	name := c.Param("eventName")
	initDate := c.Param("initDate")

	err := h.eventService.DeleteEventByNameAndInitDate(name, initDate)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.Set("responseMessage", "Data inválida. Use o formato RFC3339")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}

		if errors.Is(err, ErrEventNotFound) {
			c.Set("responseMessage", "Evento não encontrado")
			c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Evento removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Evento removido com sucesso!"})
}

// UpdateEventByNameAndInitDate atualiza os dados de um evento existente.
// @Summary Atualiza evento
// @Description Altera os dados de um evento existente
// @Tags Event Backoffice
// @Accept json
// @Produce json
// @Param eventName path string true "Nome do evento"
// @Param initDate path string true "Data de início do evento (RFC3339)"
// @Param request body event.UpdateEventRequest true "Dados para atualização"
// @Success 200 {object} map[string]interface{} "Evento atualizado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos ou data inválida"
// @Failure 404 {object} map[string]string "Evento não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/events/{eventName}/{initDate} [put]
func (h *EventHandler) UpdateEventByNameAndInitDate(c *gin.Context) {
	name := c.Param("eventName")
	initDate := c.Param("initDate")

	var request UpdateEventRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	event, err := h.eventService.UpdateEventByNameAndInitDate(name, initDate, request)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.Set("responseMessage", "Data inválida. Use o formato RFC3339")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}

		if errors.Is(err, ErrEventNotFound) {
			c.Set("responseMessage", "Evento não encontrado")
			c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Evento atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Evento atualizado com sucesso!", "event": event})
}

// GetEvents retorna a lista paginada de eventos com suporte a filtros e ordenação.
// @Summary Lista eventos
// @Description Retorna uma lista paginada de eventos cadastrados
// @Tags Event Público
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(init_date)
// @Param sort_order query string false "Ordem (asc/desc)" default(asc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de eventos paginada"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Router /events [get]
func (h *EventHandler) GetEvents(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "init_date")
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

	result, err := h.eventService.GetEvents(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.Set("responseMessage", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Set("responseMessage", "Eventos listados com sucesso!")
	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"events":           result.Events,
	})
}
