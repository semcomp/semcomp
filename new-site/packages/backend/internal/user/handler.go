package user

import (
	"backend/internal/apierrors"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgconn"
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
		if unmarshalErr, ok := err.(*json.UnmarshalTypeError); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("O campo '%s' recebeu um valor do tipo %s, mas esperava %s",
				unmarshalErr.Field, unmarshalErr.Value, unmarshalErr.Type), err))
			return
		}

		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)",
				validationErrs[0].Field(), validationErrs[0].Tag()), err))
			return
		}
		return
	}

	safeUser, err := h.userService.CreateUser(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Usuário criado com sucesso!")
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

	result, err := h.userService.GetAllUsers(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Usuários listados com sucesso!")
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

// GetUserByID retorna um usuário específico buscando pelo seu ID passado na URL.
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	user, err := h.userService.GetUserByID(uint(id))
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Usuário encontrado com sucesso!")
	c.JSON(http.StatusOK, user)
}

// UpdateUser atualiza os dados de um usuário existente buscando pelo ID fornecido na URL.
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	var request UpdateUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		if unmarshalErr, ok := err.(*json.UnmarshalTypeError); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("O campo '%s' recebeu um valor do tipo %s, mas esperava %s",
				unmarshalErr.Field, unmarshalErr.Value, unmarshalErr.Type), err))
			return
		}

		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)",
				validationErrs[0].Field(), validationErrs[0].Tag()), err))
			return
		}
		return
	}

	if err := h.userService.UpdateUser(uint(id), request); err != nil {
		// TODO: Pensar se é o melhor jeito de fazer isso. Há a possibilidade de
		// fazer essa verificação meio unificada para todos, tipo um método de
		// "conversão erro-código" e deveria estar no service se possível
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			// Código de chave duplicada, no caso, a única possível é a de email
			if pgErr.Code == "23505" {
				apierrors.HandleAPIError(c, apierrors.ConflictError("Email já cadastrado para outro usuário", err))
				return
			}
		}
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Usuário atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Usuário atualizado com sucesso!"})
}

// DeleteUser remove um usuário do sistema identificando-o pelo ID na URL.
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	if _, err = h.userService.GetUserByID(uint(id)); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	if err := h.userService.DeleteUser(uint(id)); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Usuário removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Usuário removido com sucesso!"})
}
