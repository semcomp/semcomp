package presencesettings

import (
	"net/http"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
)

type PresenceSettingsHandler struct {
	service PresenceSettingsService
}

func NewPresenceSettingsHandler(service PresenceSettingsService) *PresenceSettingsHandler {
	return &PresenceSettingsHandler{service: service}
}

// GetWeights retorna a lista de pesos de presença por tipo de evento.
// @Summary Lista pesos de presença
// @Description Retorna os tipos de evento e seus pesos de presença
// @Tags Presence Settings Backoffice
// @Produce json
// @Success 200 {object} PresencesSettingsListResult "Pesos listados com sucesso"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/presence-settings [get]
func (h *PresenceSettingsHandler) GetWeights(c *gin.Context) {
	result, err := h.service.GetWeights()
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Pesos de presença listados com sucesso!")
	c.JSON(http.StatusOK, result)
}

// CreateWeight cria um novo peso de presença para um tipo de evento.
// @Summary Cria peso de presença
// @Description Associa um tipo de evento a um peso de presença
// @Tags Presence Settings Backoffice
// @Accept json
// @Produce json
// @Param request body CreatePresenceTypeWeightRequest true "Dados do peso"
// @Success 201 {object} map[string]interface{} "Peso criado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 409 {object} map[string]string "Tipo já cadastrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/presence-settings [post]
func (h *PresenceSettingsHandler) CreateWeight(c *gin.Context) {
	var request CreatePresenceTypeWeightRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	weight, err := h.service.CreatePresenceTypeWeight(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Peso de presença criado com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Peso de presença criado com sucesso!", "weight": weight})
}

// UpdateWeight atualiza o peso (ou renomeia o tipo) de uma configuração existente.
// @Summary Atualiza peso de presença
// @Description Altera o tipo e/ou o peso de presença de uma configuração identificada pelo nome do tipo
// @Tags Presence Settings Backoffice
// @Accept json
// @Produce json
// @Param typeName path string true "Nome atual do tipo de evento"
// @Param request body UpdatePresenceTypeWeightRequest true "Novos dados do peso"
// @Success 200 {object} map[string]interface{} "Peso atualizado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Configuração não encontrada"
// @Failure 409 {object} map[string]string "Tipo já cadastrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/presence-settings/{typeName} [put]
func (h *PresenceSettingsHandler) UpdateWeight(c *gin.Context) {
	typeName := c.Param("typeName")

	var request UpdatePresenceTypeWeightRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados da requisição inválidos", err))
		return
	}

	weight, err := h.service.UpdatePresenceTypeWeight(typeName, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Peso de presença atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Peso de presença atualizado com sucesso!", "weight": weight})
}

// DeleteWeight remove a configuração de peso de um tipo de evento.
// @Summary Remove peso de presença
// @Description Remove o peso associado a um tipo de evento; eventos desse tipo passam a valer 0
// @Tags Presence Settings Backoffice
// @Produce json
// @Param typeName path string true "Nome do tipo de evento"
// @Success 200 {object} map[string]string "Peso removido com sucesso"
// @Failure 404 {object} map[string]string "Configuração não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/presence-settings/{typeName} [delete]
func (h *PresenceSettingsHandler) DeleteWeight(c *gin.Context) {
	typeName := c.Param("typeName")

	err := h.service.DeletePresenceTypeWeight(typeName)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Peso de presença removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Peso de presença removido com sucesso!"})
}
