package authBackoffice

import (
	"errors"
	"net/http"

	"backend/internal/apierrors"
	"backend/internal/permission"
	"backend/internal/userBackoffice"
	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// Biblioteca de validação para validar os campos de entrada
var validate = validator.New()

type AuthBackofficeHandler struct {
	authBackofficeService AuthBackofficeService
	userBackofficeService userBackoffice.UserBackofficeService
	permissionService     permission.PermissionService
}

func NewAuthBackofficeHandler(authBackofficeService AuthBackofficeService, userBackofficeService userBackoffice.UserBackofficeService, permissionService permission.PermissionService) *AuthBackofficeHandler {
	return &AuthBackofficeHandler{authBackofficeService: authBackofficeService, userBackofficeService: userBackofficeService, permissionService: permissionService}
}

// LoginBackofficeHandler autentica um usuário do backoffice.
// @Summary Login do backoffice
// @Description Autentica um usuário administrador e retorna o token JWT com permissões
// @Tags Auth Backoffice
// @Accept json
// @Produce json
// @Param request body authBackoffice.LoginUserBackofficeRequest true "Credenciais de login"
// @Success 200 {object} map[string]interface{} "Login realizado"
// @Failure 400 {object} map[string]string "JSON ou requisição inválida"
// @Failure 401 {object} map[string]string "Email e/ou senha inválidos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Router /admin/login [post]
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

	message := "Login realizado"

	// Busca das permissões referentes a esse usuário
	permissions, err := h.permissionService.GetPermissionByUser(backofficeRecord.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Usuário existe mas ainda não tem permissões cadastradas — login liberado com permissões vazias
			message = "Login realizado, mas você não possui permissões"
		} else {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Erro na obtenção das permissões do usuário"})
			return
		}
	} else if len(permissions) == 0 {
		message = "Login realizado, mas você não possui permissões"
	}

	// Confirmacao de login do usuario do backoffice (passa o token para o cliente)
	c.Header("Content-Type", "application/json")
	c.Status(http.StatusOK)
	c.JSON(http.StatusOK, gin.H{
		"message": message,
		"user":    userBackoffice.ToSafeUserB(backofficeRecord),
		"permissions": permissions,
		"token":   token,
	})
}
