package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// Biblioteca de validação para validar os campos de entrada
var validate = validator.New()

type AuthHandler struct {
	authService AuthService
}

func NewAuthHandler(authService AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) LoginHandler(c *gin.Context) {
	// Verifica request body e decodifica para struct
	var request LoginUserRequest
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

	userRecord, token, errLogin := h.authService.Login(request)
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

	// Confirmacao de login do usuario (passa o token para o cliente)
	c.Header("Content-Type", "application/json")
	c.Status(http.StatusOK)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": map[string]string{
			"name":      userRecord.Name,
			"last_name": userRecord.LastName,
			"email":     userRecord.Email,
		},
		"token": token,
	})
}

func (h *AuthHandler) ProfileHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _ := c.Get("userID")
		email, _ := c.Get("email")

		// Teste de rota protegida, apenas para verificar se o middleware de autenticação JWT está funcionando corretamente
		c.Header("Content-Type", "application/json")
		c.Status(http.StatusOK)
		c.JSON(http.StatusOK, gin.H{
			"message": "Entrada Permitida",
			"userID":  userID,
			"email":   email,
		})
	}
}
