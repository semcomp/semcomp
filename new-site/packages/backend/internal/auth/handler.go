package auth

import (
	"net/http"

	"backend/internal/apierrors"
	user "backend/internal/user"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// Biblioteca de validação para validar os campos de entrada
var validate = validator.New()

type AuthHandler struct {
	authService AuthService
	userService user.UserService
}

func NewAuthHandler(authService AuthService, userService user.UserService) *AuthHandler {
	return &AuthHandler{authService: authService, userService: userService}
}

// @Summary Login de participante
// @Description Autentica um usuário participante e retorna o token JWT do site público
// @Tags Auth Público
// @Accept json
// @Produce json
// @Param request body LoginUserRequest true "Credenciais de login"
// @Success 200 {object} map[string]interface{} "Login successful"
// @Failure 400 {object} map[string]string "JSON ou requisição inválida"
// @Failure 401 {object} map[string]string "Email e/ou senha inválidos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Router /login [post]
func (h *AuthHandler) LoginHandler(c *gin.Context) {
	// Verifica request body e decodifica para struct
	var request LoginUserRequest
	errReq := c.ShouldBindJSON(&request)
	if errReq != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Requisição inválida", errReq))
		return
	}

	errValidate := validate.Struct(request)
	if errValidate != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Requisição inválida", errValidate))
		return
	}

	safeUser, token, errLogin := h.authService.Login(request)
	if errLogin != nil {
		apierrors.HandleAPIError(c, errLogin)
		return
	}

	// Confirmação de login do usuário (retorna token e dados do usuário)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    safeUser,
		"token":   token,
	})
}

// ProfileHandler retorna os dados do perfil do usuário autenticado.
// @Summary Perfil do usuário
// @Description Retorna os dados do usuário autenticado via token JWT
// @Tags Auth Público
// @Produce json
// @Success 200 {object} map[string]interface{} "Entrada Permitida"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/profile [get]
func (h *AuthHandler) ProfileHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userNumber := c.MustGet("userNumber").(uint)
		user, err := h.userService.GetUserByID(uint(userNumber))
		if err != nil {
			apierrors.HandleAPIError(c, err)
			return
		}

		// Teste de rota protegida, apenas para verificar se o middleware de autenticação JWT está funcionando corretamente
		c.Header("Content-Type", "application/json")
		c.Status(http.StatusOK)
		c.Set("responseMessage", "Entrada Permitida")
		c.JSON(http.StatusOK, gin.H{
			"message":       "Entrada Permitida",
			"user_number":   user.UserNumber,
			"email":         user.Email,
			"name":          user.Name,
			"presence_rate": user.PresenceRate,
		})
	}
}
