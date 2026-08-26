package riddle

import (
	"net/http"
	"strconv"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
)

type RiddleHandler struct {
	riddleService RiddleService
}

func NewRiddleHandler(riddleService RiddleService) *RiddleHandler {
	return &RiddleHandler{riddleService: riddleService}
}

func parseRiddleID(c *gin.Context) (uint, error) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

// CreateRiddle processa o payload JSON e cria um novo riddle no final da fila.
// @Summary Cria um novo riddle
// @Description Cadastra um enigma no sistema, sempre ao final da fila atual
// @Tags Riddle Backoffice
// @Accept json
// @Produce json
// @Param request body riddle.CreateRiddleRequest true "Dados do riddle"
// @Success 201 {object} map[string]interface{} "Riddle criado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/riddles [post]
func (h *RiddleHandler) CreateRiddle(c *gin.Context) {
	var request CreateRiddleRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	riddle, err := h.riddleService.CreateRiddle(request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Riddle criado com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Riddle criado com sucesso!", "riddle": riddle})
}

// GetRiddleByID retorna um riddle específico pelo ID.
// @Summary Busca riddle por ID
// @Description Retorna os dados de um riddle específico
// @Tags Riddle Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do riddle"
// @Success 200 {object} riddle.Riddle "Riddle encontrado"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Riddle não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/riddles/{id} [get]
func (h *RiddleHandler) GetRiddleByID(c *gin.Context) {
	id, err := parseRiddleID(c)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	riddle, err := h.riddleService.GetRiddleByID(id)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Riddle encontrado com sucesso!")
	c.JSON(http.StatusOK, riddle)
}

// UpdateRiddle atualiza os dados de um riddle existente (incluindo o toggle IsActive).
// @Summary Atualiza riddle
// @Description Altera os dados de um riddle existente, incluindo ativação/desativação
// @Tags Riddle Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do riddle"
// @Param request body riddle.UpdateRiddleRequest true "Dados para atualização"
// @Success 200 {object} map[string]interface{} "Riddle atualizado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos ou ID inválido"
// @Failure 404 {object} map[string]string "Riddle não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/riddles/{id} [put]
func (h *RiddleHandler) UpdateRiddle(c *gin.Context) {
	id, err := parseRiddleID(c)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	var request UpdateRiddleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	riddle, err := h.riddleService.UpdateRiddle(id, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Riddle atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Riddle atualizado com sucesso!", "riddle": riddle})
}

// DeleteRiddle remove logicamente um riddle (soft delete), sem alterar a ordem dos demais.
// @Summary Remove riddle (soft delete)
// @Description Marca um riddle como inativo; nunca apaga a linha do banco
// @Tags Riddle Backoffice
// @Accept json
// @Produce json
// @Param id path int true "ID do riddle"
// @Success 200 {object} map[string]string "Riddle removido com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Riddle não encontrado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/riddles/{id} [delete]
func (h *RiddleHandler) DeleteRiddle(c *gin.Context) {
	id, err := parseRiddleID(c)
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	if err := h.riddleService.DeleteRiddle(id); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Riddle removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Riddle removido com sucesso!"})
}

// GetRiddles retorna a lista paginada de riddles (ativos e inativos) com suporte a filtros e ordenação.
// @Summary Lista riddles
// @Description Retorna uma lista paginada de riddles cadastrados, incluindo os inativos
// @Tags Riddle Backoffice
// @Accept json
// @Produce json
// @Param page query int false "Página atual" default(1)
// @Param limit query int false "Limite de itens por página" default(10)
// @Param sort_by query string false "Campo de ordenação" default(id)
// @Param sort_order query string false "Ordem (asc/desc)" default(asc)
// @Param search_by query string false "Campo de busca"
// @Param search_value query string false "Valor de busca"
// @Success 200 {object} map[string]interface{} "Lista de riddles paginada"
// @Failure 400 {object} map[string]string "Parâmetro inválido"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/riddles [get]
func (h *RiddleHandler) GetRiddles(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "id")
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

	result, err := h.riddleService.GetRiddles(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Riddles listados com sucesso!")
	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"riddles":          result.Riddles,
	})
}

// authedUserNumber lê o userNumber autenticado do contexto Gin (injetado pelo
// AuthMiddleware nas rotas /api). Retorna 0 quando não autenticado.
func authedUserNumber(c *gin.Context) uint {
	return c.GetUint("userNumber")
}

// CreateTeam cria a equipe do participante autenticado (fluxo auto-serviço).
// @Summary Cria uma equipe
// @Description Cria uma equipe com o usuário autenticado como fundador e gera um código de convite para os demais entrarem
// @Tags Riddle Site
// @Accept json
// @Produce json
// @Param request body riddle.CreateMyTeamRequest true "Dados da equipe"
// @Success 201 {object} map[string]interface{} "Equipe criada com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Não autenticado"
// @Failure 409 {object} map[string]string "Usuário já pertence a uma equipe"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /riddles/create-team [post]
func (h *RiddleHandler) CreateTeam(c *gin.Context) {
	userNumber := authedUserNumber(c)
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	var request CreateMyTeamRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	team, err := h.riddleService.CreateTeam(userNumber, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Equipe criada com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Equipe criada com sucesso!", "team": team})
}

// JoinTeam adiciona o participante autenticado a uma equipe pelo código.
// @Summary Entra em uma equipe
// @Description Adiciona o usuário autenticado à equipe identificada pelo código de convite
// @Tags Riddle Site
// @Accept json
// @Produce json
// @Param request body riddle.JoinTeamRequest true "Código de convite"
// @Success 200 {object} map[string]interface{} "Entrou na equipe com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Não autenticado"
// @Failure 404 {object} map[string]string "Código de convite inválido"
// @Failure 409 {object} map[string]string "Usuário já em equipe ou equipe cheia"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /riddles/join-team [post]
func (h *RiddleHandler) JoinTeam(c *gin.Context) {
	userNumber := authedUserNumber(c)
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	var request JoinTeamRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	team, err := h.riddleService.JoinTeam(userNumber, request.Code)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Entrou na equipe com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Entrou na equipe com sucesso!", "team": team})
}

// GetMyGame retorna o estado do jogo do participante autenticado.
// @Summary Estado do jogo do participante
// @Description Retorna a equipe (ou null), o total de enigmas ativos e o próximo enigma a resolver — nunca a resposta correta
// @Tags Riddle Site
// @Produce json
// @Success 200 {object} riddle.MyGameResponse "Estado do jogo"
// @Failure 401 {object} map[string]string "Não autenticado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /riddles/my-game [get]
func (h *RiddleHandler) GetMyGame(c *gin.Context) {
	userNumber := authedUserNumber(c)
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	response, err := h.riddleService.GetMyGame(userNumber)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Estado do jogo carregado com sucesso!")
	c.JSON(http.StatusOK, response)
}

// SolveRiddle valida a resposta do participante e avança o progresso da equipe.
// @Summary Resolve um enigma
// @Description Valida a resposta para o próximo enigma da equipe. Correto avança o progresso (ou conclui o jogo); incorreto mantém o mesmo enigma
// @Tags Riddle Site
// @Accept json
// @Produce json
// @Param request body riddle.SolveRiddleRequest true "Tentativa de resposta"
// @Success 200 {object} riddle.SolveResult "Resultado da tentativa"
// @Failure 400 {object} map[string]string "Enigma fora de ordem ou dados inválidos"
// @Failure 401 {object} map[string]string "Não autenticado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /riddles/solve [post]
func (h *RiddleHandler) SolveRiddle(c *gin.Context) {
	userNumber := authedUserNumber(c)
	if userNumber == 0 {
		apierrors.HandleAPIError(c, apierrors.UnauthorizedError("Usuário não autenticado", nil))
		return
	}

	var request SolveRiddleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	result, err := h.riddleService.SolveRiddle(userNumber, request.RiddleID, request.Answer)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Enigma resolvido!")
	c.JSON(http.StatusOK, result)
}

// UploadRiddlesCSV substitui totalmente a fila de riddles a partir de um CSV.
// @Summary Importa riddles via CSV (substitui tudo)
// @Description Recebe um CSV (título, subtítulo, resposta, link da imagem) e substitui totalmente o conjunto de riddles, na ordem das linhas do arquivo. Os riddles anteriores são apagados fisicamente do banco (hard delete), não apenas desativados.
// @Tags Riddle Backoffice
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Arquivo CSV"
// @Success 200 {object} map[string]interface{} "Riddles importados com sucesso"
// @Failure 400 {object} map[string]string "Arquivo inválido ou CSV mal formatado"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/riddles/upload-csv [post]
func (h *RiddleHandler) UploadRiddlesCSV(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Arquivo 'file' é obrigatório", err))
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.InternalServerError("Erro ao abrir o arquivo enviado", err))
		return
	}
	defer file.Close()

	riddles, err := h.riddleService.ReplaceRiddlesFromCSV(file)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.Set("responseMessage", "Riddles importados com sucesso!")
	c.JSON(http.StatusOK, gin.H{
		"message": "Riddles importados com sucesso!",
		"riddles": riddles,
	})
}
