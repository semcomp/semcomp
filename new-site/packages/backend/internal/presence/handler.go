package presence

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
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
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	presence, err := h.presenceService.CreatePresence(request)
	if err != nil {
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Presença criada com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Presença criada com sucesso!", "presence": presence})
}

// GetPresences retorna a lista paginada de presenças com suporte a filtros e ordenação.
func (h *PresenceHandler) GetPresences(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	sortBy := c.DefaultQuery("sort_by", "event_init_date")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.Set("responseMessage", "Parâmetro 'page' inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'page' inválido"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.Set("responseMessage", "Parâmetro 'limit' inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'limit' inválido"})
		return
	}

	result, err := h.presenceService.GetPresences(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.Set("responseMessage", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Set("responseMessage", "Presenças listadas com sucesso!")
	c.JSON(http.StatusOK, result)
}

// GetPresenceByNameEventandInitDate retorna uma presença específica buscando por nome, evento e data de início.
func (h *PresenceHandler) GetPresenceByNameEventandInitDate(c *gin.Context) {
	name := c.Param("name")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	presence, err := h.presenceService.GetPresenceByNameEventandInitDate(name, eventName, eventInitDate)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.Set("responseMessage", "invalid event date format")
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event date format"})
			return
		}
		if errors.Is(err, ErrPresenceNotFound) {
			c.Set("responseMessage", "presence not found")
			c.JSON(http.StatusNotFound, gin.H{"error": "presence not found"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Presença encontrada com sucesso!")
	c.JSON(http.StatusOK, presence)
}

// UpdatePresenceByNameEventandInitDate atualiza uma presença existente identificada por nome, evento e data de início.
func (h *PresenceHandler) UpdatePresenceByNameEventandInitDate(c *gin.Context) {
	name := c.Param("name")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	var request UpdatePresenceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	err := h.presenceService.UpdatePresenceByNameEventandInitDate(name, eventName, eventInitDate, request)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.Set("responseMessage", "Data inválida. Use o formato RFC3339")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}
		if errors.Is(err, ErrPresenceNotFound) {
			c.Set("responseMessage", "Presença não pôde ser computada.")
			c.JSON(http.StatusNotFound, gin.H{"error": "Presença não pôde ser computada."})
			return
		}

		// Detecta PostgreSQL a violção de chave primária
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				c.Set("responseMessage", "Já existe presença com essa chave")
				c.JSON(http.StatusBadRequest, gin.H{"error": "Já existe presença com essa chave"})
				return
			}
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Presença atualizada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Presença atualizada com sucesso!"})
}

// DeletePresenceByNameEventandInitDate remove uma presença identificada por nome, evento e data de início.
func (h *PresenceHandler) DeletePresenceByNameEventandInitDate(c *gin.Context) {
	name := c.Param("name")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	err := h.presenceService.DeletePresenceByNameEventandInitDate(name, eventName, eventInitDate)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.Set("responseMessage", "Data inválida. Use o formato RFC3339")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}
		if errors.Is(err, ErrPresenceNotFound) {
			c.Set("responseMessage", "Remoção de presença não pôde ser computada.")
			c.JSON(http.StatusNotFound, gin.H{"error": "Remoção de presença não pôde ser computada."})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Presença removida com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Presença removida com sucesso!"})
}
