package permission

import (
	"errors"
	"net/http"
	"slices"
	"strconv"

	"backend/internal/apierrors"
	"backend/internal/userBackoffice"
	"github.com/gin-gonic/gin"
)

type PermissionHandler struct {
	permissionService     PermissionService
	userBackofficeService userBackoffice.UserBackofficeService
}

func NewPermissionHandler(permissionService PermissionService, userBService userBackoffice.UserBackofficeService) *PermissionHandler {
	return &PermissionHandler{permissionService: permissionService, userBackofficeService: userBService}
}

// CreatePermission processa o payload JSON e tenta criar uma nova permissão.
// @Summary Cria uma nova permissão
// @Description Vincula uma permissão (R ou RW) de um usuário do backoffice a uma seção
// @Tags Permission Backoffice
// @Accept json
// @Produce json
// @Param request body permission.PermissionRequest true "Dados da permissão"
// @Success 201 {object} map[string]interface{} "Permissão criada com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos, seção/usuário inexistente ou tipo inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/permissions [post]
func (h *PermissionHandler) CreatePermission(c *gin.Context) {
	var request PermissionRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if !slices.Contains(KnownSections, request.SectionName) {
		c.Set("responseMessage", "Seção inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Seção inexistente"})
		return
	}

	if _, err := h.userBackofficeService.GetUserByEmail(request.UserEmail); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	if request.PermissionType == nil || (*request.PermissionType != "R" && *request.PermissionType != "RW") {
		c.Set("responseMessage", "Valor de Permissão inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor de Permissão inválido"})
		return
	}

	permission, err := h.permissionService.CreatePermission(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Permissão criada com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Permissão criada com sucesso!", "permission": permission})
}

// GetPermissions retorna a lista paginada de permissões com suporte a filtros e ordenação.
// @Summary Lista permissões
// @Description Retorna uma lista paginada de permissões cadastradas
// @Tags Permission Backoffice
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(user_email)
// @Param sort_order query string false "Ordem (asc/desc)" default(asc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de permissões paginada"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/permissions [get]
func (h *PermissionHandler) GetPermissions(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	sortBy := c.DefaultQuery("sort_by", "user_email")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.Set("responseMessage", "Parâmetro 'page' inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'page' inválido"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.Set("responseMessage", "Parâmetro 'limit' inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'limit' inválido"})
		return
	}

	result, err := h.permissionService.GetPermissions(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.Set("responseMessage", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response := gin.H{
 		"page":         page,
 		"limit":        limit,
 		"sort_by":      sortBy,
 		"sort_order":   sortOrder,
 		"search_by":    searchBy,
 		"search_value": searchValue,
 		"data":         result,
 	}

	c.Set("responseMessage", "Permissões listadas com sucesso!")
	c.JSON(http.StatusOK, response)
}

// GetMyPermissions retorna as permissões do admin autenticado, lidas do token JWT.
// @Summary Busca minhas permissões
// @Description Retorna as permissões do próprio admin autenticado
// @Tags Permission Backoffice
// @Produce json
// @Success 200 {array} permission.Permission "Permissões encontradas"
// @Failure 404 {object} map[string]string "Permissão não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/permissions/me [get]
func (h *PermissionHandler) GetMyPermissions(c *gin.Context) {
	email := c.MustGet("email").(string)

	permission, err := h.permissionService.GetPermissionByUser(email)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Permissão encontrada com sucesso!")
	c.JSON(http.StatusOK, permission)
}

// GetPermissionBySection retorna as permissões vinculadas a uma seção específica.
// @Summary Busca permissões por seção
// @Description Retorna as permissões vinculadas a uma seção
// @Tags Permission Backoffice
// @Accept json
// @Produce json
// @Param section path string true "Nome da seção"
// @Success 200 {array} permission.Permission "Permissões encontradas"
// @Failure 400 {object} map[string]string "Seção inexistente"
// @Failure 404 {object} map[string]string "Permissão não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/permissions/section/{section} [get]
func (h *PermissionHandler) GetPermissionBySection(c *gin.Context) {
	section := c.Param("section")

	if !slices.Contains(KnownSections, section) {
		c.Set("responseMessage", "Seção inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Seção inexistente"})
		return
	}

	permission, err := h.permissionService.GetPermissionBySection(section)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Permissão encontrada com sucesso!")
	c.JSON(http.StatusOK, permission)
}

// UpdatePermissionByUserSection atualiza uma permissão existente.
// @Summary Atualiza permissão
// @Description Altera os dados de uma permissão existente identificada por usuário e seção
// @Tags Permission Backoffice
// @Accept json
// @Produce json
// @Param user path string true "Email do usuário do backoffice"
// @Param section path string true "Nome da seção"
// @Param request body permission.PermissionRequest true "Dados para atualização"
// @Success 200 {object} map[string]string "Permissão atualizada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos, seção/usuário inexistente ou tipo inválido"
// @Failure 404 {object} map[string]string "Permissão não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/permissions/{user}/{section} [put]
func (h *PermissionHandler) UpdatePermissionByUserSection(c *gin.Context) {
	user := c.Param("user")
	section := c.Param("section")

	var request PermissionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if !slices.Contains(KnownSections, request.SectionName) {
		c.Set("responseMessage", "Seção inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Seção inexistente"})
		return
	}

	if _, err := h.userBackofficeService.GetUserByEmail(request.UserEmail); err != nil {
		c.Set("responseMessage", "Usuário do Backoffice inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuário do Backoffice inexistente"})
		return
	}

	if request.PermissionType != nil && (*request.PermissionType != "R" && *request.PermissionType != "RW") {
		c.Set("responseMessage", "Valor de Permissão inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor de Permissão inválido"})
		return
	}

	err := h.permissionService.UpdatePermissionByUserSection(user, section, request)
	if err != nil {
		if errors.Is(err, ErrPermissionNotFound) {
			c.Set("responseMessage", "Permissão não pôde ser alterada.")
			c.JSON(http.StatusNotFound, gin.H{"error": "Permissão não pôde ser alterada."})
			return
		}

		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Permissão atualizada com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Permissão atualizada com sucesso!"})
}

// DeletePermissionByUserSection remove uma permissão identificada por usuário e seção.
// @Summary Deleta permissão
// @Description Remove uma permissão do sistema
// @Tags Permission Backoffice
// @Accept json
// @Produce json
// @Param user path string true "Email do usuário do backoffice"
// @Param section path string true "Nome da seção"
// @Success 200 {object} map[string]string "Permissão removida com sucesso"
// @Failure 404 {object} map[string]string "Permissão não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/permissions/{user}/{section} [delete]
func (h *PermissionHandler) DeletePermissionByUserSection(c *gin.Context) {
	user := c.Param("user")
	section := c.Param("section")

	err := h.permissionService.DeletePermissionByUserSection(user, section)
	if err != nil {
		if errors.Is(err, ErrPermissionNotFound) {
			c.Set("responseMessage", "Remoção de permissão não pôde ser computada.")
			c.JSON(http.StatusNotFound, gin.H{"error": "Remoção de permissão não pôde ser computada."})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Permissão removida com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Permissão removida com sucesso!"})
}
