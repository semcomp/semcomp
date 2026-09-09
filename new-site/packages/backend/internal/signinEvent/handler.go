package signinEvent

import (
	"backend/internal/apierrors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SigninEventHandler struct {
	service SigninEventService
}

func NewSigninEventHandler(service SigninEventService) *SigninEventHandler {
	return &SigninEventHandler{service: service}
}

// CreateSignin processa o payload JSON e tenta criar uma nova inscrição.
// @Summary Inscreve o usuário autenticado em um evento
// @Description Registra a inscrição do usuário logado em um evento que permite inscrição (has_signin). Dentro do limite de vagas o usuário fica com status "Esperando Doação"; se as vagas estiverem esgotadas, entra na lista de espera.
// @Tags Signin Event
// @Accept json
// @Produce json
// @Param request body signinEvent.CreateSigninRequest true "Dados da inscrição"
// @Success 201 {object} map[string]interface{} "Inscrição criada com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Evento não encontrado"
// @Failure 409 {object} map[string]string "Inscrição já existente / evento sem inscrição"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/signin-events [post]
func (h *SigninEventHandler) CreateSignin(c *gin.Context) {
	userNumber := c.GetUint("userNumber")

	var request CreateSigninRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	signin, err := h.service.CreateSignin(userNumber, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrição criada com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Inscrição criada com sucesso!", "signin": signin})
}

// GetSigninEvents lista todos os eventos que permitem inscrição.
// @Summary Lista eventos passíveis de inscrição
// @Description Retorna todos os eventos com has_signin = true
// @Tags Signin Event
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "Lista de eventos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/signin-events [get]
func (h *SigninEventHandler) GetSigninEvents(c *gin.Context) {
	events, err := h.service.GetSigninEvents()
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Eventos para inscrição listados com sucesso!")
	c.JSON(http.StatusOK, gin.H{"events": events})
}

// GetMySignins lista as inscrições ativas do usuário autenticado.
// @Summary Lista inscrições do usuário logado
// @Description Retorna as inscrições ativas do usuário autenticado com detalhes do evento (status e posição na fila)
// @Tags Signin Event
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "Lista de inscrições"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/signin-events/me [get]
func (h *SigninEventHandler) GetMySignins(c *gin.Context) {
	userNumber := c.GetUint("userNumber")

	signins, err := h.service.GetMySignins(userNumber)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrições do usuário listadas com sucesso!")
	c.JSON(http.StatusOK, gin.H{"signins": signins})
}

// DeleteSignin cancela a inscrição do usuário autenticado em um evento.
// @Summary Cancela a inscrição do usuário em um evento
// @Description Deleta a inscrição do usuário logado no evento informado, reorganizando as posições da fila
// @Tags Signin Event
// @Accept json
// @Produce json
// @Param eventName path string true "Nome do evento"
// @Param eventInitDate path string true "Data de início do evento (RFC3339)"
// @Success 200 {object} map[string]string "Inscrição cancelada com sucesso"
// @Failure 400 {object} map[string]string "Data inválida"
// @Failure 404 {object} map[string]string "Inscrição não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/signin-events/{eventName}/{eventInitDate} [delete]
func (h *SigninEventHandler) DeleteSignin(c *gin.Context) {
	userNumber := c.GetUint("userNumber")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	err := h.service.DeleteSignin(userNumber, eventName, eventInitDate)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrição cancelada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Inscrição cancelada com sucesso!"})
}

// GetSigninsAdmin lista paginada de inscrições (backoffice).
// @Summary Lista inscrições (backoffice)
// @Description Retorna a lista paginada de inscrições com filtros e ordenação
// @Tags Signin Event Backoffice
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(event_init_date)
// @Param sort_order query string false "Ordem (asc/desc)" default(asc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} signinEvent.SigninEventListResult "Lista paginada de inscrições"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/signin-events [get]
func (h *SigninEventHandler) GetSigninsAdmin(c *gin.Context) {
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

	result, err := h.service.GetSigninsAdmin(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrições listadas com sucesso!")
	c.JSON(http.StatusOK, result)
}

// GetSigninAdmin retorna uma inscrição específica por chave composta (backoffice).
// @Summary Busca inscrição por chave composta
// @Description Retorna a inscrição pelo número do usuário, nome do evento e data de início
// @Tags Signin Event Backoffice
// @Accept json
// @Produce json
// @Param userNumber path string true "Número do usuário"
// @Param eventName path string true "Nome do evento"
// @Param eventInitDate path string true "Data de início do evento (RFC3339)"
// @Success 200 {object} signinEvent.SigninEvent "Inscrição encontrada"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Inscrição não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/signin-events/{userNumber}/{eventName}/{eventInitDate} [get]
func (h *SigninEventHandler) GetSigninAdmin(c *gin.Context) {
	userNumber := c.Param("userNumber")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	signin, err := h.service.GetSigninAdmin(userNumber, eventName, eventInitDate)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrição encontrada com sucesso!")
	c.JSON(http.StatusOK, signin)
}

// CreateSigninAdmin cria uma inscrição (backoffice).
// @Summary Cria uma inscrição (backoffice)
// @Description Registra uma inscrição de um usuário em um evento
// @Tags Signin Event Backoffice
// @Accept json
// @Produce json
// @Param request body signinEvent.CreateSigninAdminRequest true "Dados da inscrição"
// @Success 201 {object} map[string]interface{} "Inscrição criada com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 409 {object} map[string]string "Inscrição já existente"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/signin-events [post]
func (h *SigninEventHandler) CreateSigninAdmin(c *gin.Context) {
	var request CreateSigninAdminRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	signin, err := h.service.CreateSigninAdmin(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrição criada com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Inscrição criada com sucesso!", "signin": signin})
}

// UpdateSigninAdmin atualiza o status de uma inscrição (backoffice).
// @Summary Atualiza inscrição (backoffice)
// @Description Altera o status de uma inscrição existente identificada pela chave composta
// @Tags Signin Event Backoffice
// @Accept json
// @Produce json
// @Param userNumber path string true "Número do usuário"
// @Param eventName path string true "Nome do evento"
// @Param eventInitDate path string true "Data de início do evento (RFC3339)"
// @Param request body signinEvent.UpdateSigninAdminRequest true "Dados para atualização"
// @Success 200 {object} map[string]interface{} "Inscrição atualizada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos/pré-condição"
// @Failure 404 {object} map[string]string "Inscrição não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/signin-events/{userNumber}/{eventName}/{eventInitDate} [put]
func (h *SigninEventHandler) UpdateSigninAdmin(c *gin.Context) {
	userNumber := c.Param("userNumber")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	var request UpdateSigninAdminRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	signin, err := h.service.UpdateSigninAdmin(userNumber, eventName, eventInitDate, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrição atualizada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Inscrição atualizada com sucesso!", "signin": signin})
}

// DeleteSigninAdmin remove uma inscrição por chave composta (backoffice).
// @Summary Deleta inscrição (backoffice)
// @Description Remove permanentemente uma inscrição identificada pela chave composta
// @Tags Signin Event Backoffice
// @Accept json
// @Produce json
// @Param userNumber path string true "Número do usuário"
// @Param eventName path string true "Nome do evento"
// @Param eventInitDate path string true "Data de início do evento (RFC3339)"
// @Success 200 {object} map[string]string "Inscrição removida com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Inscrição não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/signin-events/{userNumber}/{eventName}/{eventInitDate} [delete]
func (h *SigninEventHandler) DeleteSigninAdmin(c *gin.Context) {
	userNumber := c.Param("userNumber")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	err := h.service.DeleteSigninAdmin(userNumber, eventName, eventInitDate)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrição removida com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Inscrição removida com sucesso!"})
}

// RegisterSigninAdmin marca uma inscrição como registrada (backoffice).
// @Summary Registra uma inscrição (backoffice)
// @Description Altera o status de uma inscrição para "Inscrito"
// @Tags Signin Event Backoffice
// @Accept json
// @Produce json
// @Param userNumber path string true "Número do usuário"
// @Param eventName path string true "Nome do evento"
// @Param eventInitDate path string true "Data de início do evento (RFC3339)"
// @Success 200 {object} map[string]interface{} "Inscrição registrada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Inscrição não encontrada"
// @Failure 409 {object} map[string]string "Inscrição já registrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/signin-events/{userNumber}/{eventName}/{eventInitDate}/register [put]
func (h *SigninEventHandler) RegisterSigninAdmin(c *gin.Context) {
	userNumber := c.Param("userNumber")
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	signin, err := h.service.RegisterSigninAdmin(userNumber, eventName, eventInitDate)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Inscrição registrada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Inscrição registrada com sucesso!", "signin": signin})
}

// RotateSigninsAdmin remove inscrições aguardando doação e promove a fila de espera (backoffice).
// @Summary Rotaciona as inscrições de um evento (backoffice)
// @Description Remove todas as inscrições com status "Esperando Doação" e promove os primeiros da fila de espera para "Inscrito", recompondo as posições da fila
// @Tags Signin Event Backoffice
// @Accept json
// @Produce json
// @Param eventName path string true "Nome do evento"
// @Param eventInitDate path string true "Data de início do evento (RFC3339)"
// @Success 200 {object} map[string]interface{} "Rotação realizada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Evento não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/signin-events/rotate/{eventName}/{eventInitDate} [post]
func (h *SigninEventHandler) RotateSigninsAdmin(c *gin.Context) {
	eventName := c.Param("eventName")
	eventInitDate := c.Param("eventInitDate")

	signins, err := h.service.RotateSigninsAdmin(eventName, eventInitDate)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Rotação de inscrições realizada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Rotação de inscrições realizada com sucesso!", "signins": signins})
}
