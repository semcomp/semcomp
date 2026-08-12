package signinEvent

import (
	"backend/internal/apierrors"
	"net/http"

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
// @Description Registra a inscrição do usuário logado em um evento que permite inscrição (has_signin). Se as vagas estiverem esgotadas, insere em lista de espera.
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