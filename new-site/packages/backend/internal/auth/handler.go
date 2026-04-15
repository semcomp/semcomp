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

func (h *AuthHandler) RegisterHandler(c *gin.Context) {
	// Verifica request body e decodifica para struct
	var request RegisterUserRequest
	errReq := c.ShouldBindJSON(&request)
	if errReq != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid json register request"})
		return
	}

	errVal := validate.Struct(request)
	if errVal != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid register request: " + errVal.Error()})
		return
	}

	createdUser, errRegister := h.authService.Register(request)
	if errRegister != nil {
		if errors.Is(errRegister, ErrEmailAlreadyExists) {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
			return
		}
		if errRegister.Error() == "create user failed" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Create user failed"})
			return
		}
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Confirmacao de criacao do usuario
	c.Header("Content-Type", "application/json")
	c.Status(http.StatusCreated)
	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user": map[string]string{
			"name":      createdUser.Name,
			"last_name": createdUser.LastName,
			"email":     createdUser.Email,
		},
	})
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
