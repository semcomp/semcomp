package presence

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// PresenceHandler lida com as requisições HTTP para a entidade Presence.
type PresenceHandler struct {
	presenceService PresenceService
}

// NewPresenceHandler inicializa e retorna uma nova instância de PresenceHandler.
func NewPresenceHandler(presenceService PresenceService) *PresenceHandler {
	return &PresenceHandler{presenceService: presenceService}
}

// CreatePresence processa o payload JSON e tenta criar uma nova presença.
func (h *PresenceHandler) CreatePresence(c *gin.Context) {
	var request CreatePresenceRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	presence, err := h.presenceService.CreatePresence(request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Presença criada com sucesso!", "presence": presence})
}

// GetPresences retorna a lista paginada de presenças com suporte a filtros e ordenação.
func (h *PresenceHandler) GetPresences(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	sortBy := c.DefaultQuery("sort_by", "event_date_time")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'page' inválido"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'limit' inválido"})
		return
	}

	result, err := h.presenceService.GetPresences(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetPresenceByNameEventandDate retorna uma presença específica buscando por nome, evento e data.
func (h *PresenceHandler) GetPresenceByNameEventandDate(c *gin.Context) {
	name := c.Param("name")
	eventName := c.Param("eventName")
	eventDate := c.Param("eventDate")

	presence, err := h.presenceService.GetPresenceByNameEventandDate(name, eventName, eventDate)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event date format"})
			return
		}
		if errors.Is(err, ErrPresenceNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "presence not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, presence)
}

// UpdatePresenceByNameEventandDate atualiza uma presença existente identificada por nome, evento e data.
func (h *PresenceHandler) UpdatePresenceByNameEventandDate(c *gin.Context) {
	name := c.Param("name")
	eventName := c.Param("eventName")
	eventDate := c.Param("eventDate")

	var request UpdatePresenceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	err := h.presenceService.UpdatePresenceByNameEventandDate(name, eventName, eventDate, request)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}
		if errors.Is(err, ErrPresenceNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Presença não pôde ser computada."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Presença atualizada com sucesso!"})
}

// DeletePresenceByNameEventandDate remove uma presença identificada por nome, evento e data.
func (h *PresenceHandler) DeletePresenceByNameEventandDate(c *gin.Context) {
	name := c.Param("name")
	eventName := c.Param("eventName")
	eventDate := c.Param("eventDate")

	err := h.presenceService.DeletePresenceByNameEventandDate(name, eventName, eventDate)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}
		if errors.Is(err, ErrPresenceNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Remoção de presença não pôde ser computada."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Presença removida com sucesso!"})
}
