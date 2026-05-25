package authBackoffice

import (
	"net/http"

	"backend/internal/apierrors"
	userBackoffice "backend/internal/userBackoffice"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// Biblioteca de validação para validar os campos de entrada
var validate = validator.New()

type AuthBackofficeHandler struct {
	authBackofficeService AuthBackofficeService
	userBackofficeService userBackoffice.UserBackofficeService
}

func NewAuthBackofficeHandler(authBackofficeService AuthBackofficeService, userBackofficeService userBackoffice.UserBackofficeService) *AuthBackofficeHandler {
	return &AuthBackofficeHandler{authBackofficeService: authBackofficeService, userBackofficeService: userBackofficeService}
}

func (h *AuthBackofficeHandler) LoginBackofficeHandler(c *gin.Context) {
	// Verifica request body e decodifica para struct
	var request LoginUserBackofficeRequest
	errReq := c.ShouldBindJSON(&request)
	if errReq != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("JSON inválido", errReq))
		return
	}

	errValidate := validate.Struct(request)
	if errValidate != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados de login inválidos", errValidate))
		return
	}

	backofficeRecord, token, errLogin := h.authBackofficeService.Login(request)
	if errLogin != nil {
		apierrors.HandleAPIError(c, errLogin)
		return
	}

	// Confirmacao de login do usuario do backoffice (passa o token para o cliente)
	c.Header("Content-Type", "application/json")
	c.Status(http.StatusOK)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    userBackoffice.ToSafeUserB(backofficeRecord),
		"token":   token,
	})
}
