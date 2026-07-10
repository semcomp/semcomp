package userBackoffice

import (
	"backend/internal/apierrors"
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

// CreateUser insere novos dados de usuário.
// @Summary Cria usuário do backoffice
// @Description Cadastra um novo usuário administrador no backoffice
// @Tags Usuários (Admins)
// @Accept json
// @Produce json
// @Param request body userBackoffice.CreateUserBackofficeRequest true "Dados de cadastro"
// @Success 201 {object} map[string]interface{} "Usuário criado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/usersBackoffice [post]
func (h *UserBackofficeHandler) CreateUser(c *gin.Context) {
	var request CreateUserBackofficeRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		if len(request.Password) < 8 { // Isso deveria estar no service
			apierrors.HandleAPIError(c, apierrors.ValidationError("A senha deve conter no mínimo 8 caracteres", err))
			return
		}
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	safeUser, err := h.userBackofficeService.CreateUser(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso!", "user": safeUser})
}

// GetAllUsers retorna os dados de todos os usuários do backoffice,
// considerando os valores de ordenação e busca passados por parâmetro.
// @Summary Lista usuários do backoffice
// @Description Retorna uma lista paginada de usuários administradores
// @Tags Usuários (Admins)
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(email)
// @Param sort_order query string false "Ordem (asc/desc)" default(asc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de usuários paginada"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/usersBackoffice [get]
func (h *UserBackofficeHandler) GetAllUsers(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "email")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	if pageQuery := c.Query("page"); pageQuery != "" {
		parsedPage, err := strconv.Atoi(pageQuery)
		if err != nil {
			apierrors.HandleAPIError(c, apierrors.ValidationError("Parâmetro 'page' inválido", err))
			return
		}
		page = parsedPage
	}

	if limitQuery := c.Query("limit"); limitQuery != "" {
		parsedLimit, err := strconv.Atoi(limitQuery)
		if err != nil {
			apierrors.HandleAPIError(c, apierrors.ValidationError("Parâmetro 'limit' inválido", err))
			return
		}
		limit = parsedLimit
	}

	result, err := h.userBackofficeService.GetAllUsers(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
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

// GetUserByEmail retorna os dados de um usuário do sistema.
// @Summary Busca usuário do backoffice por email
// @Description Retorna os dados de um usuário administrador específico
// @Tags Usuários (Admins)
// @Accept json
// @Produce json
// @Param email path string true "Email do usuário"
// @Success 200 {object} userBackoffice.SafeUserB "Usuário encontrado"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Security BearerAuth
// @Router /admin/usersBackoffice/{email} [get]
func (h *UserBackofficeHandler) GetUserByEmail(c *gin.Context) {
	email := c.Param("email")

	user, err := h.userBackofficeService.GetUserByEmail(email)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

// UpdateUser altera os dados de um usuário do sistema identificando-o pelo email na URL.
// @Summary Atualiza usuário do backoffice
// @Description Altera os dados de um usuário administrador existente
// @Tags Usuários (Admins)
// @Accept json
// @Produce json
// @Param email path string true "Email do usuário"
// @Param request body userBackoffice.UpdateUserBackofficeRequest true "Dados para atualização"
// @Success 200 {object} map[string]string "Usuário atualizado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/usersBackoffice/{email} [put]
func (h *UserBackofficeHandler) UpdateUser(c *gin.Context) {
	email := c.Param("email")

	var request UpdateUserBackofficeRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		if len(request.Password) < 8 { // Deveria estar no service
			apierrors.HandleAPIError(c, apierrors.ValidationError("A senha deve conter no mínimo 8 caracteres", err))
			return
		}
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	if err := h.userBackofficeService.UpdateUser(email, request); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuário atualizado com sucesso!"})
}

// DeleteUser remove um usuário do sistema identificando-o pelo email na URL.
// @Summary Deleta usuário do backoffice
// @Description Remove um usuário administrador do sistema
// @Tags Usuários (Admins)
// @Accept json
// @Produce json
// @Param email path string true "Email do usuário"
// @Success 200 {object} map[string]string "Usuário removido com sucesso"
// @Failure 500 {object} map[string]string "Usuário não existe ou erro interno"
// @Security BearerAuth
// @Router /admin/usersBackoffice/{email} [delete]
func (h *UserBackofficeHandler) DeleteUser(c *gin.Context) {
	email := c.Param("email")

	if _, err := h.userBackofficeService.GetUserByEmail(email); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	if err := h.userBackofficeService.DeleteUser(email); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuário removido com sucesso!"})
}
