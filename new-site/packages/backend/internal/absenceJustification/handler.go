package absenceJustification

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
)

// AbsenceJustificationHandler lida com as requisições HTTP para justificativas de ausência.
type AbsenceJustificationHandler struct {
	service AbsenceJustificationService
}

// NewAbsenceJustificationHandler inicializa e retorna uma nova instância de AbsenceJustificationHandler.
func NewAbsenceJustificationHandler(service AbsenceJustificationService) *AbsenceJustificationHandler {
	return &AbsenceJustificationHandler{service: service}
}

const maxAttachmentBytes = 1 * 1024 * 1024

var allowedAttachmentTypes = map[string]bool{
	"application/pdf": true,
	"image/jpeg":      true,
	"image/png":       true,
	"image/webp":      true,
}

// readAttachment lê e valida o arquivo do campo multipart "attachment". required
// controla se a ausência do campo é um erro (criação) ou não (edição, onde o anexo
// é opcional — mantém o anterior se nada for enviado).
func readAttachment(c *gin.Context, required bool) (filename string, contentType string, data []byte, apiErr *apierrors.APIError) {
	file, header, fileErr := c.Request.FormFile("attachment")
	if fileErr != nil {
		if required {
			return "", "", nil, apierrors.ValidationError("O anexo comprobatório é obrigatório", fileErr)
		}
		return "", "", nil, nil
	}
	defer file.Close()

	// header.Size vem do Content-Length do part multipart (client-controlled);
	// serve apenas como rejeição antecipada quando o cliente o informa corretamente.
	if header.Size > maxAttachmentBytes {
		return "", "", nil, apierrors.ValidationError("O anexo não pode ultrapassar 1MB", nil)
	}

	buf := make([]byte, 512)
	if _, err := file.Read(buf); err != nil {
		return "", "", nil, apierrors.InternalServerError("Erro ao ler anexo", err)
	}
	contentType = http.DetectContentType(buf)

	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return "", "", nil, apierrors.InternalServerError("Erro ao processar anexo", err)
	}

	if !allowedAttachmentTypes[contentType] {
		return "", "", nil, apierrors.ValidationError("Tipo de arquivo não permitido. Aceitamos PDF, JPEG, PNG ou WebP", nil)
	}

	// LimitReader garante o limite real independente do header.Size informado.
	lr := io.LimitReader(file, maxAttachmentBytes+1)
	data, err := io.ReadAll(lr)
	if err != nil {
		return "", "", nil, apierrors.InternalServerError("Erro ao ler anexo", err)
	}
	if int64(len(data)) > maxAttachmentBytes {
		return "", "", nil, apierrors.ValidationError("O anexo não pode ultrapassar 1MB", nil)
	}

	return header.Filename, contentType, data, nil
}

// CreateAbsenceJustification permite que o usuário autenticado envie sua justificativa de ausência.
// @Summary Envia a justificativa de ausência do usuário autenticado
// @Description Registra a justificativa de ausência (referente à SEMCOMP como um todo) do usuário autenticado, com anexo comprobatório. Cada usuário só pode ter uma justificativa.
// @Tags Justificativas de Ausência
// @Accept multipart/form-data
// @Produce json
// @Param reason formData string true "Motivo da ausência"
// @Param attachment formData file true "Comprovante (PDF/JPEG/PNG/WebP, máx 10MB)"
// @Success 201 {object} map[string]interface{} "Justificativa enviada com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 409 {object} map[string]string "Justificativa já enviada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/absence-justifications [post]
func (h *AbsenceJustificationHandler) CreateAbsenceJustification(c *gin.Context) {
	email := c.MustGet("email").(string)

	var request CreateAbsenceJustificationRequest
	if err := c.ShouldBind(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	filename, contentType, data, apiErr := readAttachment(c, true)
	if apiErr != nil {
		apierrors.HandleAPIError(c, apiErr)
		return
	}
	request.AttachmentFilename = filename
	request.AttachmentContentType = contentType
	request.AttachmentData = data

	justification, err := h.service.CreateAbsenceJustification(email, request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	message := "Justificativa de ausência enviada com sucesso!"
	c.Set("responseMessage", message)
	c.JSON(http.StatusCreated, gin.H{"message": message, "absence_justification": justification})
}

// GetMine retorna a justificativa de ausência do usuário autenticado.
// @Summary Obtém a justificativa de ausência do usuário autenticado
// @Description Retorna a justificativa de ausência enviada pelo usuário autenticado, se houver
// @Tags Justificativas de Ausência
// @Produce json
// @Success 200 {object} map[string]interface{} "Justificativa do usuário"
// @Failure 404 {object} map[string]string "Nenhuma justificativa enviada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/absence-justifications/mine [get]
func (h *AbsenceJustificationHandler) GetMine(c *gin.Context) {
	email := c.MustGet("email").(string)

	justification, err := h.service.GetMine(email)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"absence_justification": justification})
}

// UpdateMine permite que o usuário autenticado edite sua justificativa, exceto se já aprovada ou negada.
// @Summary Atualiza a justificativa de ausência do usuário autenticado
// @Description Edita o motivo e, opcionalmente, substitui o anexo da justificativa do usuário autenticado. Permitido apenas quando o status for "em_analise" ou "documento_invalido"; editar reenvia a justificativa para análise.
// @Tags Justificativas de Ausência
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "ID da justificativa"
// @Param reason formData string true "Motivo da ausência"
// @Param attachment formData file false "Novo comprovante (opcional, substitui o anterior)"
// @Success 200 {object} map[string]interface{} "Justificativa atualizada com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 403 {object} map[string]string "Justificativa não pertence ao usuário"
// @Failure 404 {object} map[string]string "Justificativa não encontrada"
// @Failure 409 {object} map[string]string "Justificativa já aprovada ou negada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/absence-justifications/{id} [patch]
func (h *AbsenceJustificationHandler) UpdateMine(c *gin.Context) {
	email := c.MustGet("email").(string)

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	var request UpdateAbsenceJustificationRequest
	if err := c.ShouldBind(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	filename, contentType, data, apiErr := readAttachment(c, false)
	if apiErr != nil {
		apierrors.HandleAPIError(c, apiErr)
		return
	}
	request.AttachmentFilename = filename
	request.AttachmentContentType = contentType
	request.AttachmentData = data

	justification, err := h.service.UpdateJustification(email, uint(id), request)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	message := "Justificativa de ausência atualizada com sucesso!"
	c.Set("responseMessage", message)
	c.JSON(http.StatusOK, gin.H{"message": message, "absence_justification": justification})
}

// GetOwnAttachment serve o anexo da justificativa do próprio usuário autenticado.
// @Summary Obtém o anexo da própria justificativa de ausência
// @Description Retorna o arquivo comprobatório da justificativa do usuário autenticado
// @Tags Justificativas de Ausência
// @Produce octet-stream
// @Param id path int true "ID da justificativa"
// @Success 200 {file} file "Arquivo anexo"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 403 {object} map[string]string "Justificativa não pertence ao usuário"
// @Failure 404 {object} map[string]string "Justificativa não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /api/absence-justifications/{id}/attachment [get]
func (h *AbsenceJustificationHandler) GetOwnAttachment(c *gin.Context) {
	email := c.MustGet("email").(string)

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	justification, err := h.service.GetOwnAttachment(email, uint(id))
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	safeName := strings.NewReplacer(`"`, ``, "\r", ``, "\n", ``).Replace(justification.AttachmentFilename)
	c.Header("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, safeName))
	c.Header("Cache-Control", "no-store")
	c.File(justification.AttachmentFilePath)
}

// GetAbsenceJustifications lista todas as justificativas de ausência (admin).
// @Summary Lista justificativas de ausência
// @Description Retorna todas as justificativas de ausência cadastradas
// @Tags Justificativas de Ausência
// @Produce json
// @Success 200 {object} map[string]interface{} "Lista de justificativas de ausência"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/absence-justifications [get]
func (h *AbsenceJustificationHandler) GetAbsenceJustifications(c *gin.Context) {
	justifications, err := h.service.GetAllAbsenceJustifications()
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Justificativas de ausência listadas com sucesso!")
	c.JSON(http.StatusOK, gin.H{"absence_justifications": justifications})
}

// GetAttachment serve o anexo de uma justificativa de ausência para download (admin).
// @Summary Obtém o anexo de uma justificativa de ausência
// @Description Retorna o arquivo comprobatório de uma justificativa de ausência específica
// @Tags Justificativas de Ausência
// @Produce octet-stream
// @Param id path int true "ID da justificativa"
// @Success 200 {file} file "Arquivo anexo"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 404 {object} map[string]string "Justificativa não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/absence-justifications/{id}/attachment [get]
func (h *AbsenceJustificationHandler) GetAttachment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	justification, err := h.service.GetAttachment(uint(id))
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	safeName := strings.NewReplacer(`"`, ``, "\r", ``, "\n", ``).Replace(justification.AttachmentFilename)
	c.Header("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, safeName))
	c.Header("Cache-Control", "no-store")
	c.File(justification.AttachmentFilePath)
}

// UpdateStatus altera o status de uma justificativa de ausência (admin).
// @Summary Atualiza o status de uma justificativa de ausência
// @Description Aprova, rejeita, marca como documento inválido ou volta para análise uma justificativa de ausência. Ao negar, o campo rejection_reason é obrigatório e só persiste nesse status.
// @Tags Justificativas de Ausência
// @Accept json
// @Produce json
// @Param id path int true "ID da justificativa"
// @Param request body absenceJustification.UpdateStatusRequest true "Novo status"
// @Success 200 {object} map[string]string "Status atualizado com sucesso!"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 404 {object} map[string]string "Justificativa não encontrada"
// @Failure 500 {object} map[string]string "Erro interno"
// @Security BearerAuth
// @Router /admin/absence-justifications/{id} [patch]
func (h *AbsenceJustificationHandler) UpdateStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("ID inválido", err))
		return
	}

	var request UpdateStatusRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	if err := h.service.UpdateStatus(uint(id), request.Status, request.RejectionReason); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	message := "Status da justificativa de ausência atualizado com sucesso!"
	c.Set("responseMessage", message)
	c.JSON(http.StatusOK, gin.H{"message": message})
}
