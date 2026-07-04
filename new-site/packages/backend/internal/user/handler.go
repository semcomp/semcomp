package user

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"backend/internal/token"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
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
		  c.Set("responseMessage", "Dados inválidos")
		  c.JSON(http.StatusBadRequest, gin.H{
		   	"error": fmt.Sprintf("O campo '%s' recebeu um valor do tipo %s, mas esperava %s", 
					unmarshalErr.Field, unmarshalErr.Value, unmarshalErr.Type),
			})
			return
    	}

		if validationErrs, ok := err.(validator.ValidationErrors); ok {
		  c.Set("responseMessage", "Dados inválidos")
			fieldErr := validationErrs[0]
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)", 
					fieldErr.Field(), fieldErr.Tag()),
			})
			return
		}
	}

	safeUser, err := h.userService.CreateUser(request)
	if err != nil {
		if errors.Is(err, ErrEmailAlreadyExists) {
		  	c.Set("responseMessage", "E-mail já cadastrado")
			c.JSON(http.StatusConflict, gin.H{"error": "E-mail já cadastrado"})
			return
		}
    
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno. Tente novamente mais tarde."})
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
			c.Set("responseMessage", "Parâmetro 'page' inválido")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'page' inválido"})
			return
		}
		page = parsedPage
	}

	if limitQuery := c.Query("limit"); limitQuery != "" {
		parsedLimit, err := strconv.Atoi(limitQuery)
		if err != nil {
			c.Set("responseMessage", "Parâmetro 'limit' inválido")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'limit' inválido"})
			return
		}
		limit = parsedLimit
	}

	result, err := h.userService.GetAllUsers(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
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
		c.Set("responseMessage", "ID inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	user, err := h.userService.GetUserByID(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.Set("responseMessage", "Usuário não encontrado")
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Usuário encontrado com sucesso!")
	c.JSON(http.StatusOK, user)
}

// UpdateUser atualiza os dados de um usuário existente buscando pelo ID fornecido na URL.
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.Set("responseMessage", "ID inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var request UpdateUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		if unmarshalErr, ok := err.(*json.UnmarshalTypeError); ok {
		  	c.Set("responseMessage", "Dados inválidos")
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("O campo '%s' recebeu um valor do tipo %s, mas esperava %s",
					unmarshalErr.Field, unmarshalErr.Value, unmarshalErr.Type),
			})
			return
		}

		if validationErrs, ok := err.(validator.ValidationErrors); ok {
		  	c.Set("responseMessage", "Dados inválidos")
			fieldErr := validationErrs[0]
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)",
					fieldErr.Field(), fieldErr.Tag()),
			})
			return
		}
    
		return
	}

	if err := h.userService.UpdateUser(uint(id), request); err != nil {
		// TODO: Pensar se é o melhor jeito de fazer isso. Há a possibilidade de
		// fazer essa verificação meio unificada para todos, tipo um método de
		// "conversão erro-código"
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			// Código de chave duplicada, no caso, a única possível é a de email
			if pgErr.Code == "23505" {
				c.Set("responseMessage", "Email já cadastrado para outro usuário")
				c.JSON(http.StatusConflict, gin.H{"error": "Email já cadastrado para outro usuário"})
				return
			}
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Usuário atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Usuário atualizado com sucesso!"})
}

// DeleteUser remove um usuário do sistema identificando-o pelo ID na URL.
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.Set("responseMessage", "ID inválido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if _, err = h.userService.GetUserByID(uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.Set("responseMessage", "Usuário a ser deletado não existe")
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário a ser deletado não existe"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	if err := h.userService.DeleteUser(uint(id)); err != nil {
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	c.Set("responseMessage", "Usuário removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Usuário removido com sucesso!"})
}

// VerifyEmailHandler verifica o e-mail do usuário a partir do token.
func (h *UserHandler) VerifyEmailHandler(c *gin.Context) {
	tokenPlain := c.Query("token")
	if tokenPlain == "" {
		c.Set("responseMessage", "Token não fornecido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token não fornecido"})
		return
	}

	userNumber := c.MustGet("userNumber").(uint)

	err := h.userService.VerifyEmail(tokenPlain, userNumber)
	if err != nil {
		if errors.Is(err, token.ErrInvalidToken) {
			c.Set("responseMessage", "Token inválido")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token inválido"})
			return
		}
		if errors.Is(err, token.ErrTokenExpired) {
			c.Set("responseMessage", "Token expirado")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token expirado"})
			return
		}
		if errors.Is(err, token.ErrTokenUsed) {
			c.Set("responseMessage", "Token já utilizado")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token já utilizado"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno. Tente novamente mais tarde."})
		return
	}

	c.Set("responseMessage", "E-mail verificado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "E-mail verificado com sucesso!"})
}

// ForgotPasswordHandler solicita a recuperação de senha.
func (h *UserHandler) ForgotPasswordHandler(c *gin.Context) {
	var request ForgotPasswordRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			c.Set("responseMessage", "Dados inválidos")
			fieldErr := validationErrs[0]
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)",
					fieldErr.Field(), fieldErr.Tag()),
			})
			return
		}
		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "E-mail inválido"})
		return
	}

	_ = h.userService.RequestPasswordReset(request.Email)

	c.Set("responseMessage", "Se o e-mail existir, você receberá um link de recuperação.")
	c.JSON(http.StatusOK, gin.H{"message": "Se o e-mail existir, você receberá um link de recuperação."})
}

// ResetPasswordHandler redefina a senha do usuário.
func (h *UserHandler) ResetPasswordHandler(c *gin.Context) {
	var request ResetPasswordRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		if unmarshalErr, ok := err.(*json.UnmarshalTypeError); ok {
			c.Set("responseMessage", "Dados inválidos")
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("O campo '%s' recebeu um valor do tipo %s, mas esperava %s",
					unmarshalErr.Field, unmarshalErr.Value, unmarshalErr.Type),
			})
			return
		}

		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			c.Set("responseMessage", "Dados inválidos")
			fieldErr := validationErrs[0]
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)",
					fieldErr.Field(), fieldErr.Tag()),
			})
			return
		}

		c.Set("responseMessage", "Dados inválidos")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	err := h.userService.ResetPassword(request.Token, request.NewPassword)
	if err != nil {
		if errors.Is(err, token.ErrInvalidToken) {
			c.Set("responseMessage", "Token inválido")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token inválido"})
			return
		}
		if errors.Is(err, token.ErrTokenExpired) {
			c.Set("responseMessage", "Token expirado")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token expirado"})
			return
		}
		if errors.Is(err, token.ErrTokenUsed) {
			c.Set("responseMessage", "Token já utilizado")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token já utilizado"})
			return
		}
		c.Set("internalError", err)
		c.Set("responseMessage", "Erro interno do servidor")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno. Tente novamente mais tarde."})
		return
	}

	c.Set("responseMessage", "Senha redefinida com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Senha redefinida com sucesso!"})
}
