package user

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UserHandler lida com as requisições HTTP para a entidade User.
type UserHandler struct {
	userService UserService
}

// NewUserHandler inicializa e retorna uma nova instância de UserHandler.
func NewUserHandler(userService UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// CreateUser processa o payload JSON e tenta criar um novo usuário.
func (h *UserHandler) CreateUser(c *gin.Context) {
	var request CreateUserRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	safeUser, err := h.userService.CreateUser(request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}) // TODO: verificar qual erro seria mais adequado de retornar
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso!", "user": safeUser})
}

// GetAllUsers retorna todos os usuários cadastrados.
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "name")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	if pageQuery := c.Query("page"); pageQuery != "" {
		parsedPage, err := strconv.Atoi(pageQuery)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'page' inválido"})
			return
		}
		page = parsedPage
	}

	if limitQuery := c.Query("limit"); limitQuery != "" {
		parsedLimit, err := strconv.Atoi(limitQuery)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'limit' inválido"})
			return
		}
		limit = parsedLimit
	}

	result, err := h.userService.GetAllUsers(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"users":           	result.Users,
	})
}

// GetUserByID retorna um usuário específico buscando pelo seu ID passado na URL.
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	user, err := h.userService.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// UpdateUser atualiza os dados de um usuário existente buscando pelo ID fornecido na URL.
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var request UpdateUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if err := h.userService.UpdateUser(uint(id), request); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuário atualizado com sucesso!"})
}

// DeleteUser remove um usuário do sistema identificando-o pelo ID na URL.
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.userService.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuário removido com sucesso!"})
}
