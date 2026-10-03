package absenceJustification

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"backend/internal/apierrors"
)

type AbsenceJustificationService interface {
	SetRateRecalculator(recalculator RateRecalculator)
	CreateAbsenceJustification(userEmail string, request CreateAbsenceJustificationRequest) (*AbsenceJustificationInfo, error)
	GetMine(userEmail string) (*AbsenceJustificationInfo, error)
	UpdateJustification(userEmail string, id uint, request UpdateAbsenceJustificationRequest) (*AbsenceJustificationInfo, error)
	GetOwnAttachment(userEmail string, id uint) (*AbsenceJustification, error)
	GetAllAbsenceJustifications() ([]AbsenceJustificationInfo, error)
	GetAttachment(id uint) (*AbsenceJustification, error)
	UpdateStatus(id uint, status string, rejectionReason string) error
}

// RateRecalculator dispara o recálculo das taxas de presença após mutações.
type RateRecalculator interface {
	RecalculateUsers(userNumbers ...int64) error
}

type absenceJustificationService struct {
	repo         AbsenceJustificationRepository
	recalculator RateRecalculator
}

func NewAbsenceJustificationService(repo AbsenceJustificationRepository) AbsenceJustificationService {
	return &absenceJustificationService{repo: repo}
}

func (s *absenceJustificationService) SetRateRecalculator(recalculator RateRecalculator) {
	s.recalculator = recalculator
}

// recalcUserByEmail resolve o email para user_number e dispara o recálculo.
func (s *absenceJustificationService) recalcUserByEmail(email string) {
	if s.recalculator == nil {
		return
	}
	userNumber, err := s.repo.FindUserNumberByEmail(email)
	if err != nil {
		log.Printf("[absenceJustification] erro ao resolver user_number para recálculo: %v", err)
		return
	}
	if err := s.recalculator.RecalculateUsers(userNumber); err != nil {
		log.Printf("[absenceJustification] erro ao recalcular taxa de presença: %v", err)
	}
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
	// Reenviar para análise limpa qualquer motivo de rejeição anterior.
	justification.RejectionReason = nil

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

// UpdateStatus altera o status de uma justificativa (admin). O motivo da negativa é
// obrigatório quando status="negado" e só persiste nesse status; em qualquer outro
// status o motivo é sempre limpo.
func (s *absenceJustificationService) UpdateStatus(id uint, status string, rejectionReason string) error {
	// Buscar o status atual e o email para disparar recálculo se necessário
	justification, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	oldStatus := justification.Status

	if status == StatusNegado {
		if strings.TrimSpace(rejectionReason) == "" {
			return apierrors.ValidationError("Informe o motivo da negativa da justificativa", nil)
		}
		if err := s.repo.UpdateStatus(id, status, &rejectionReason); err != nil {
			return err
		}
	} else {
		if err := s.repo.UpdateStatus(id, status, nil); err != nil {
			return err
		}
	}

	// Se o status virou ou deixou de ser "aprovado", recalcular taxa de presença do usuário
	if oldStatus != status && (oldStatus == StatusAprovado || status == StatusAprovado) {
		s.recalcUserByEmail(justification.UserEmail)
	}

	return nil
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
