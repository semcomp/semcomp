package absenceJustification

import (
	"crypto/rand"
	"encoding/hex"
	"os"
	"path/filepath"
	"time"

	"backend/internal/apierrors"
)

type AbsenceJustificationService interface {
	CreateAbsenceJustification(userEmail string, request CreateAbsenceJustificationRequest) (*AbsenceJustificationInfo, error)
	GetMine(userEmail string) (*AbsenceJustificationInfo, error)
	UpdateJustification(userEmail string, id uint, request UpdateAbsenceJustificationRequest) (*AbsenceJustificationInfo, error)
	GetOwnAttachment(userEmail string, id uint) (*AbsenceJustification, error)
	GetAllAbsenceJustifications() ([]AbsenceJustificationInfo, error)
	GetAttachment(id uint) (*AbsenceJustification, error)
	UpdateStatus(id uint, status string) error
}

type absenceJustificationService struct {
	repo AbsenceJustificationRepository
}

func NewAbsenceJustificationService(repo AbsenceJustificationRepository) AbsenceJustificationService {
	return &absenceJustificationService{repo: repo}
}

// CreateAbsenceJustification cria a justificativa do usuário autenticado. Cada
// participante tem no máximo uma justificativa (para a SEMCOMP como um todo, não
// por evento específico) — uma segunda tentativa retorna conflito.
func (s *absenceJustificationService) CreateAbsenceJustification(userEmail string, request CreateAbsenceJustificationRequest) (*AbsenceJustificationInfo, error) {
	if _, err := s.repo.FindByUserEmail(userEmail); err == nil {
		return nil, apierrors.ConflictError("Você já enviou uma justificativa de ausência", nil)
	}

	filePath, err := saveAttachment(request.AttachmentData, request.AttachmentContentType)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao salvar anexo da justificativa", err)
	}

	now := time.Now()
	justification := &AbsenceJustification{
		UserEmail:             userEmail,
		EventName:             WholeEventName,
		EventInitDate:         now,
		Reason:                request.Reason,
		AttachmentFilename:    request.AttachmentFilename,
		AttachmentContentType: request.AttachmentContentType,
		AttachmentFilePath:    filePath,
		SubmittedAt:           now,
		Status:                StatusEmAnalise,
	}

	if err := s.repo.Create(justification); err != nil {
		_ = os.Remove(filePath)
		return nil, apierrors.InternalServerError("Erro ao criar justificativa de ausência", err)
	}
	return s.repo.FindInfoByID(justification.ID)
}

func (s *absenceJustificationService) GetMine(userEmail string) (*AbsenceJustificationInfo, error) {
	return s.repo.FindInfoByUserEmail(userEmail)
}

// UpdateJustification permite que o próprio participante edite o motivo e,
// opcionalmente, substitua o anexo — apenas quando o status for "em_analise" ou
// "documento_invalido". Justificativas "aprovado" ou "negado" são finais e não podem
// ser editadas. Editar reenvia a justificativa para análise.
func (s *absenceJustificationService) UpdateJustification(userEmail string, id uint, request UpdateAbsenceJustificationRequest) (*AbsenceJustificationInfo, error) {
	justification, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if justification.UserEmail != userEmail {
		return nil, apierrors.ForbiddenError("Você não tem permissão para editar esta justificativa", nil)
	}

	switch justification.Status {
	case StatusEmAnalise, StatusDocumentoInvalido:
		// permitido editar
	case StatusAprovado:
		return nil, apierrors.ConflictError("Não é possível editar uma justificativa já aprovada", nil)
	case StatusNegado:
		return nil, apierrors.ConflictError("Não é possível editar uma justificativa já negada", nil)
	}

	justification.Reason = request.Reason
	justification.Status = StatusEmAnalise

	oldFilePath := ""
	if len(request.AttachmentData) > 0 {
		newFilePath, err := saveAttachment(request.AttachmentData, request.AttachmentContentType)
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao salvar anexo da justificativa", err)
		}
		oldFilePath = justification.AttachmentFilePath
		justification.AttachmentFilename = request.AttachmentFilename
		justification.AttachmentContentType = request.AttachmentContentType
		justification.AttachmentFilePath = newFilePath
	}

	if err := s.repo.Update(justification); err != nil {
		if oldFilePath != "" {
			_ = os.Remove(justification.AttachmentFilePath)
		}
		return nil, err
	}
	if oldFilePath != "" {
		_ = os.Remove(oldFilePath)
	}

	return s.repo.FindInfoByID(justification.ID)
}

// GetOwnAttachment retorna o anexo apenas se pertencer ao usuário autenticado.
func (s *absenceJustificationService) GetOwnAttachment(userEmail string, id uint) (*AbsenceJustification, error) {
	justification, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if justification.UserEmail != userEmail {
		return nil, apierrors.ForbiddenError("Você não tem permissão para acessar este anexo", nil)
	}
	return justification, nil
}

func (s *absenceJustificationService) GetAllAbsenceJustifications() ([]AbsenceJustificationInfo, error) {
	return s.repo.FindAll()
}

func (s *absenceJustificationService) GetAttachment(id uint) (*AbsenceJustification, error) {
	return s.repo.FindByID(id)
}

func (s *absenceJustificationService) UpdateStatus(id uint, status string) error {
	return s.repo.UpdateStatus(id, status)
}

const attachmentUploadDir = "uploads/absence-justifications"

func contentTypeToExt(ct string) string {
	switch ct {
	case "application/pdf":
		return ".pdf"
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/webp":
		return ".webp"
	default:
		return ""
	}
}

// saveAttachment grava os bytes em disco e retorna o path relativo
// (uploads/absence-justifications/<hex><ext>).
func saveAttachment(data []byte, contentType string) (string, error) {
	if err := os.MkdirAll(attachmentUploadDir, 0755); err != nil {
		return "", err
	}
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	filename := hex.EncodeToString(b) + contentTypeToExt(contentType)
	filePath := filepath.Join(attachmentUploadDir, filename)
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", err
	}
	return filePath, nil
}
