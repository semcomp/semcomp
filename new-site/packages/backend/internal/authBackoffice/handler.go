package authBackoffice

import (
	"errors"
	"net/http"

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
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid json login request"})
		return
	}

	errValidate := validate.Struct(request)
	if errValidate != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid auth request: " + errValidate.Error()})
		return
	}

	backofficeRecord, token, errLogin := h.authBackofficeService.Login(request)
	if errLogin != nil {
		if errors.Is(errLogin, ErrInvalidCredentials) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		if errLogin.Error() == "token generation failed" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
			return
		}
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
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
