package user

import (
	"backend/internal/apierrors"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"backend/internal/token"

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

// CreateUser processa o formulário multipart e tenta criar um novo usuário.
// @Summary Cria um novo usuário
// @Description Cadastra um participante no sistema. Aceita multipart/form-data para suportar upload do comprovante PAPFE.
// @Tags Usuários (Participantes)
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "Nome completo"
// @Param email formData string true "E-mail"
// @Param password formData string true "Senha (min 8 caracteres)"
// @Param age formData int true "Idade"
// @Param gender formData string true "Gênero"
// @Param city formData string true "Cidade"
// @Param education formData string true "Formação"
// @Param hasPapfe formData bool false "Recebe PAPFE?"
// @Param disabilities formData []string false "Lista de deficiências"
// @Param profession formData string false "Profissão"
// @Param linkedin formData string false "LinkedIn"
// @Param telegram formData string false "Telegram"
// @Param papfe_document formData file false "Comprovante PAPFE (PDF/JPEG/PNG/WebP, máx 10MB)"
// @Success 201 {object} map[string]interface{} "Usuário criado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 409 {object} map[string]string "E-mail já cadastrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Router /register [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var request CreateUserRequest

	if err := c.ShouldBind(&request); err != nil {
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)",
				validationErrs[0].Field(), validationErrs[0].Tag()), err))
			return
		}
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	if request.HasPapfe {
		file, header, fileErr := c.Request.FormFile("papfe_document")
		if fileErr != nil {
			apierrors.HandleAPIError(c, apierrors.ValidationError("O comprovante PAPFE é obrigatório quando o apoio PAPFE está marcado", fileErr))
			return
		}
		defer file.Close()

		if header.Size > 10*1024*1024 {
			apierrors.HandleAPIError(c, apierrors.ValidationError("O comprovante PAPFE não pode ultrapassar 10MB", nil))
			return
		}

		allowedTypes := map[string]bool{
			"application/pdf": true,
			"image/jpeg":      true,
			"image/png":       true,
			"image/webp":      true,
		}
		buf := make([]byte, 512)
		if _, err := file.Read(buf); err != nil {
			apierrors.HandleAPIError(c, apierrors.InternalServerError("Erro ao ler comprovante PAPFE", err))
			return
		}
		contentType := http.DetectContentType(buf)

		if _, err := file.Seek(0, io.SeekStart); err != nil {
			apierrors.HandleAPIError(c, apierrors.InternalServerError("Erro ao processar comprovante PAPFE", err))
			return
		}

		if !allowedTypes[contentType] {
			apierrors.HandleAPIError(c, apierrors.ValidationError("Tipo de arquivo não permitido. Aceitamos PDF, JPEG, PNG ou WebP", nil))
			return
		}

		data, err := io.ReadAll(file)
		if err != nil {
			apierrors.HandleAPIError(c, apierrors.InternalServerError("Erro ao ler comprovante PAPFE", err))
			return
		}

		request.PapfeFilename = header.Filename
		request.PapfeContentType = contentType
		request.PapfeData = data
	}

	safeUser, err := h.userService.CreateUser(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	message := "Cadastro realizado! Verifique seu e-mail para confirmar sua conta."
	c.Set("responseMessage", message)
	c.JSON(http.StatusCreated, gin.H{"message": message, "user": safeUser})
}

// UpdatePapfeDocument permite que o usuário autenticado atualize seu comprovante PAPFE.
// @Summary Atualiza comprovante PAPFE
// @Description Atualiza o comprovante PAPFE do usuário autenticado. Aceita multipart/form-data.
// @Tags Usuários (Participantes)
// @Accept multipart/form-data
// @Produce json
// @Param papfe_document formData file true "Comprovante PAPFE (PDF/JPEG/PNG/WebP, máx 10MB)"
// @Success 200 {object} map[string]string "Comprovante PAPFE atualizado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/papfe-document [put]
func (h *UserHandler) UpdatePapfeDocument(c *gin.Context) {
	email := c.MustGet("email").(string)

	file, header, fileErr := c.Request.FormFile("papfe_document")
	if fileErr != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Comprovante PAPFE é obrigatório", fileErr))
		return
	}
	defer file.Close()

	if header.Size > 10*1024*1024 {
		apierrors.HandleAPIError(c, apierrors.ValidationError("O comprovante PAPFE não pode ultrapassar 10MB", nil))
		return
	}

	allowedTypes := map[string]bool{
		"application/pdf": true,
		"image/jpeg":      true,
		"image/png":       true,
		"image/webp":      true,
	}
	buf := make([]byte, 512)
	if _, err := file.Read(buf); err != nil {
		apierrors.HandleAPIError(c, apierrors.InternalServerError("Erro ao ler comprovante PAPFE", err))
		return
	}
	contentType := http.DetectContentType(buf)

	if _, err := file.Seek(0, io.SeekStart); err != nil {
		apierrors.HandleAPIError(c, apierrors.InternalServerError("Erro ao processar comprovante PAPFE", err))
		return
	}

	if !allowedTypes[contentType] {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Tipo de arquivo não permitido. Aceitamos PDF, JPEG, PNG ou WebP", nil))
		return
	}

	data, err := io.ReadAll(file)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.InternalServerError("Erro ao ler comprovante PAPFE", err))
		return
	}

	if err := h.userService.UpdatePapfeDocument(email, header.Filename, contentType, data); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Comprovante PAPFE atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Comprovante PAPFE atualizado com sucesso!"})
}

// GetPapfeDocument serve o comprovante PAPFE de um usuário para download (admin).
// @Summary Obtém comprovante PAPFE de um usuário
// @Description Retorna o arquivo do comprovante PAPFE de um usuário específico
// @Tags Usuários (Participantes)
// @Produce octet-stream
// @Param id path int true "ID do usuário"
// @Success 200 {file} file "Arquivo do comprovante PAPFE"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Usuário ou comprovante não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/users/{id}/papfe-document [get]
func (h *UserHandler) GetPapfeDocument(c *gin.Context) {
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

	doc, err := h.userService.GetPapfeDocument(user.Email)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, doc.Filename))
	c.Data(http.StatusOK, doc.ContentType, doc.Data)
}

// VerifyEmail confirma o e-mail de um usuário a partir do token recebido por link.
// @Summary Confirma e-mail de um usuário
// @Description Valida o token de verificação enviado por e-mail e ativa a conta
// @Tags Usuários (Participantes)
// @Accept json
// @Produce json
// @Param request body user.VerifyEmailRequest true "Token de verificação"
// @Success 200 {object} map[string]string "E-mail confirmado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Token inválido ou expirado"
// @Router /verify-email [post]
func (h *UserHandler) VerifyEmail(c *gin.Context) {
	var request VerifyEmailRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)",
				validationErrs[0].Field(), validationErrs[0].Tag()), err))
			return
		}
		return
	}

	if err := h.userService.VerifyEmail(request.Token); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	message := "E-mail confirmado com sucesso!"
	c.Set("responseMessage", message)
	c.JSON(http.StatusOK, gin.H{"message": message})
}

// ResendVerification reenvia o e-mail de confirmação de conta.
// @Summary Reenvia e-mail de confirmação
// @Description Reenvia o link de confirmação de e-mail, se aplicável
// @Tags Usuários (Participantes)
// @Accept json
// @Produce json
// @Param request body user.ResendVerificationRequest true "E-mail do usuário"
// @Success 200 {object} map[string]string "Se o e-mail estiver cadastrado e pendente de confirmação, um novo link foi enviado"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Router /resend-verification [post]
func (h *UserHandler) ResendVerification(c *gin.Context) {
	var request ResendVerificationRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			apierrors.HandleAPIError(c, apierrors.ValidationError(fmt.Sprintf("Valor inválido para o campo '%s' (falhou na regra: %s)",
				validationErrs[0].Field(), validationErrs[0].Tag()), err))
			return
		}
		return
	}

	if err := h.userService.ResendVerification(request.Email); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	message := "Se o e-mail estiver cadastrado e pendente de confirmação, um novo link foi enviado."
	c.Set("responseMessage", message)
	c.JSON(http.StatusOK, gin.H{"message": message})
}

// GetAllUsers retorna todos os usuários cadastrados.
// @Summary Lista usuários
// @Description Retorna uma lista paginada de usuários cadastrados
// @Tags Usuários (Participantes)
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(name)
// @Param sort_order query string false "Ordem (asc/desc)" default(asc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de usuários paginada"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/users [get]
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
// @Summary Busca usuário por ID
// @Description Retorna os dados de um usuário específico
// @Tags Usuários (Participantes)
// @Accept json
// @Produce json
// @Param id path int true "ID do usuário"
// @Success 200 {object} user.SafeUser "Usuário encontrado"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/users/{id} [get]
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
// @Summary Atualiza usuário
// @Description Altera os dados de um usuário existente
// @Tags Usuários (Participantes)
// @Accept json
// @Produce json
// @Param id path int true "ID do usuário"
// @Param request body user.UpdateUserRequest true "Dados para atualização"
// @Success 200 {object} map[string]string "Usuário atualizado com sucesso"
// @Failure 400 {object} map[string]string "Dados ou ID inválidos"
// @Failure 409 {object} map[string]string "Email já cadastrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/users/{id} [put]
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
// @Summary Deleta usuário
// @Description Remove um usuário do sistema
// @Tags Usuários (Participantes)
// @Accept json
// @Produce json
// @Param id path int true "ID do usuário"
// @Success 200 {object} map[string]string "Usuário removido com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Usuário não existe"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/users/{id} [delete]
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

// VerifyEmailHandler verifica o e-mail do usuário a partir do token.
func (h *UserHandler) VerifyEmailHandler(c *gin.Context) {
	tokenPlain := c.Query("token")
	if tokenPlain == "" {
		c.Set("responseMessage", "Token não fornecido")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token não fornecido"})
		return
	}

	err := h.userService.VerifyEmail(tokenPlain)
	if err != nil {
		c.Set("internalError", err)
		c.Set("responseMessage", "Link de verificação inválido ou expirado")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Link de verificação inválido ou expirado"})
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
