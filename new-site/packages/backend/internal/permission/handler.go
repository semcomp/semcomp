package permission

import (
	"errors"
	"net/http"
	"strconv"

	"backend/internal/section"
	"backend/internal/userBackoffice"
	"github.com/gin-gonic/gin"
)

type PermissionHandler struct {
	permissionService     PermissionService
	sectionService        section.SectionService
	userBackofficeService userBackoffice.UserBackofficeService
}

func NewPermissionHandler(permissionService PermissionService, sectionService section.SectionService, userBService userBackoffice.UserBackofficeService) *PermissionHandler {
	return &PermissionHandler{permissionService: permissionService, sectionService: sectionService, userBackofficeService: userBService}
}

func (h *PermissionHandler) CreatePermission(c *gin.Context) {
	var request PermissionRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if _, err := h.sectionService.GetSectionByName(request.SectionName); err != nil {
		c.Set("responseMessage", "Seção inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Seção inexistente"})
		return
	}

	if _, err := h.userBackofficeService.GetUserByEmail(request.UserEmail); err != nil {
		c.Set("responseMessage", "Usuário do Backoffice inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuário do Backoffice inexistente"})
		return
	}

	if request.PermissionType != "R" && request.PermissionType != "RW" {
		c.Set("responseMessage", "Valor de Permissão inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor de Permissão inválido"})
		return
	}

	permission, err := h.permissionService.CreatePermission(request)
	if err != nil {
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Permissão criada com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Permissão criada com sucesso!", "permission": permission})
}

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

func (h *PermissionHandler) GetPermissionByUser(c *gin.Context) {
	user := c.Param("user")

	if _, err := h.userBackofficeService.GetUserByEmail(user); err != nil {
		c.Set("responseMessage", "Usuário do Backoffice inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuário do Backoffice inexistente"})
		return
	}

	permission, err := h.permissionService.GetPermissionByUser(user)
	if err != nil {
		if errors.Is(err, ErrPermissionNotFound) {
			c.Set("responseMessage", "Permissão não encontrada")
			c.JSON(http.StatusNotFound, gin.H{"error": "Permissão não encontrada"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Permissão encontrada com sucesso!")
	c.JSON(http.StatusOK, permission)
}

func (h *PermissionHandler) GetPermissionBySection(c *gin.Context) {
	section := c.Param("section")

	if _, err := h.sectionService.GetSectionByName(section); err != nil {
		c.Set("responseMessage", "Seção inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Seção inexistente"})
		return
	}

	permission, err := h.permissionService.GetPermissionBySection(section)
	if err != nil {
		if errors.Is(err, ErrPermissionNotFound) {
			c.Set("responseMessage", "Permissão não encontrada")
			c.JSON(http.StatusNotFound, gin.H{"error": "Permissão não encontrada"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Permissão encontrada com sucesso!")
	c.JSON(http.StatusOK, permission)
}

func (h *PermissionHandler) UpdatePermissionByUserSection(c *gin.Context) {
	user := c.Param("user")
	section := c.Param("section")

	var request PermissionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if _, err := h.sectionService.GetSectionByName(request.SectionName); err != nil {
		c.Set("responseMessage", "Seção inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Seção inexistente"})
		return
	}

	if _, err := h.userBackofficeService.GetUserByEmail(request.UserEmail); err != nil {
		c.Set("responseMessage", "Usuário do Backoffice inexistente")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuário do Backoffice inexistente"})
		return
	}

	if request.PermissionType != "R" && request.PermissionType != "RW" {
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
