package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	
	"backend/internal/models"
	"backend/internal/service"
)

// UserHandler lida com as requisições HTTP para a entidade User.
type UserHandler struct {
	userService service.UserService
}

// NewUserHandler inicializa e retorna uma nova instância de UserHandler.
func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// CreateUser processa o payload JSON e tenta criar um novo usuário.
func (h *UserHandler) CreateUser(c *gin.Context) {
	var user models.User
	
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if err := h.userService.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}) // TODO: verificar qual erro seria mais adequado de retornar
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso!"})
}