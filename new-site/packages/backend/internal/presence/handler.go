package presence

import (
	"backend/internal/apierrors"
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
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	presence, err := h.presenceService.CreatePresence(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
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
		apierrors.HandleAPIError(c, apierrors.ValidationError("Parâmetro 'page' inválido", err))
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Parâmetro 'limit' inválido", err))
		return
	}

	result, err := h.presenceService.GetPresences(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Presenças listadas com sucesso!")
	c.JSON(http.StatusOK, result)
}

// GetPresenceByNameEventandInitDate retorna uma presença específica buscando por nome, evento e data de início.
func (h *PresenceHandler) GetPresenceByUserEventandInitDate(c *gin.Context) {
	userNumber := c.Param("userNumber")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	presence, err := h.presenceService.GetPresenceByUserEventandInitDate(userNumber, eventName, eventInitDate)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Presença encontrada com sucesso!")
	c.JSON(http.StatusOK, presence)
}

// UpdatePresenceByNameEventandInitDate atualiza uma presença existente identificada por nome, evento e data de início.
func (h *PresenceHandler) UpdatePresenceByUserEventandInitDate(c *gin.Context) {
	userNumber := c.Param("userNumber")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	var request UpdatePresenceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	err := h.presenceService.UpdatePresenceByUserEventandInitDate(userNumber, eventName, eventInitDate, request)
	if err != nil {

		// Detecta PostgreSQL a violção de chave primária
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				apierrors.HandleAPIError(c, apierrors.ConflictError("Presença já existe para este usuário, evento e data de início", err))
				return
			}
		}
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Presença atualizada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Presença atualizada com sucesso!"})
}

// DeletePresenceByNameEventandInitDate remove uma presença identificada por nome, evento e data de início.
func (h *PresenceHandler) DeletePresenceByUserEventandInitDate(c *gin.Context) {
	userNumber := c.Param("userNumber")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	err := h.presenceService.DeletePresenceByUserEventandInitDate(userNumber, eventName, eventInitDate)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Presença removida com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Presença removida com sucesso!"})
}
