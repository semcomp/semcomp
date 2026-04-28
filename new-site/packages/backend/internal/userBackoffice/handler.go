package userBackoffice

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserBackofficeHandler struct {
	userBackofficeService UserBackofficeService
}

func NewUserBackofficeHandler(userBackofficeService UserBackofficeService) *UserBackofficeHandler {
	return &UserBackofficeHandler{userBackofficeService: userBackofficeService}
}

func (h *UserBackofficeHandler) CreateUser(c *gin.Context) {
	var request CreateUserBackofficeRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	safeUser, err := h.userBackofficeService.CreateUser(request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}) // TODO: verificar qual erro seria mais adequado de retornar
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso!", "user": safeUser})
}

func (h *UserBackofficeHandler) GetAllUsers(c *gin.Context) {
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

	result, err := h.userBackofficeService.GetAllUsers(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
		"users":            result.Users,
	})
}

func (h *UserBackofficeHandler) GetUserByEmail(c *gin.Context) {
	email := c.Param("email")

	user, err := h.userBackofficeService.GetUserByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserBackofficeHandler) UpdateUser(c *gin.Context) {
	email := c.Param("email")

	var request UpdateUserBackofficeRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if err := h.userBackofficeService.UpdateUser(email, request); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuário atualizado com sucesso!"})
}

// DeleteUser remove um usuário do sistema identificando-o pelo ID na URL.
func (h *UserBackofficeHandler) DeleteUser(c *gin.Context) {
	email := c.Param("email")

	if _, err := h.userBackofficeService.GetUserByEmail(email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Usuário a ser deletado não existe"})
		return
	}

	if err := h.userBackofficeService.DeleteUser(email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuário removido com sucesso!"})
}
