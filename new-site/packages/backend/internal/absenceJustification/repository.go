package absenceJustification

import (
	"errors"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type AbsenceJustificationRepository interface {
	Create(justification *AbsenceJustification) error
	Update(justification *AbsenceJustification) error
	FindAll() ([]AbsenceJustificationInfo, error)
	FindByID(id uint) (*AbsenceJustification, error)
	FindByUserEmail(email string) (*AbsenceJustification, error)
	FindInfoByID(id uint) (*AbsenceJustificationInfo, error)
	FindInfoByUserEmail(email string) (*AbsenceJustificationInfo, error)
	UpdateStatus(id uint, status string, rejectionReason *string) error
}

type absenceJustificationRepository struct {
	db *gorm.DB
}

func NewAbsenceJustificationRepository(db *gorm.DB) AbsenceJustificationRepository {
	return &absenceJustificationRepository{db: db}
}

func (r *absenceJustificationRepository) Create(justification *AbsenceJustification) error {
	return r.db.Create(justification).Error
}

// Update permite que o participante edite o motivo/anexo enquanto em análise ou com
// documento inválido. Editar reenvia para análise, então o motivo de rejeição é limpo.
func (r *absenceJustificationRepository) Update(justification *AbsenceJustification) error {
	result := r.db.Model(&AbsenceJustification{}).Where("id = ?", justification.ID).Updates(map[string]interface{}{
		"reason":                  justification.Reason,
		"status":                  justification.Status,
		"attachment_filename":     justification.AttachmentFilename,
		"attachment_content_type": justification.AttachmentContentType,
		"attachment_file_path":    justification.AttachmentFilePath,
		"rejection_reason":        justification.RejectionReason,
	})
	if result.Error != nil {
		return apierrors.InternalServerError("Erro ao atualizar justificativa de ausência", result.Error)
	}
	if result.RowsAffected == 0 {
		return apierrors.NotFoundError("Justificativa de ausência não encontrada", nil)
	}
	return nil
}

// infoQuery monta a projeção denormalizada (join com users) compartilhada por
// FindAll, FindInfoByID e FindInfoByUserEmail.
func (r *absenceJustificationRepository) infoQuery() *gorm.DB {
	return r.db.Table("absence_justifications aj").
		Select("aj.id, u.user_number, u.name AS user_name, aj.user_email, aj.event_name, aj.event_init_date, aj.reason, aj.attachment_filename, aj.attachment_content_type, aj.submitted_at, aj.status, aj.rejection_reason").
		Joins("JOIN users u ON u.email = aj.user_email")
}

// FindAll retorna todas as justificativas de ausência, com nome e número do usuário.
func (r *absenceJustificationRepository) FindAll() ([]AbsenceJustificationInfo, error) {
	var result []AbsenceJustificationInfo
	err := r.infoQuery().Order("aj.submitted_at DESC").Scan(&result).Error
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao listar justificativas de ausência", err)
	}
	return result, nil
}

func (r *absenceJustificationRepository) FindByID(id uint) (*AbsenceJustification, error) {
	var justification AbsenceJustification
	err := r.db.First(&justification, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Justificativa de ausência não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar justificativa de ausência", err)
	}
	return &justification, nil
}

func (r *absenceJustificationRepository) FindByUserEmail(email string) (*AbsenceJustification, error) {
	var justification AbsenceJustification
	err := r.db.Where("user_email = ?", email).First(&justification).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Justificativa de ausência não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar justificativa de ausência", err)
	}
	return &justification, nil
}

// FindInfoByID e FindInfoByUserEmail usam Scan (não First), que não retorna
// gorm.ErrRecordNotFound quando não há linhas — por isso checamos ID == 0.

func (r *absenceJustificationRepository) FindInfoByID(id uint) (*AbsenceJustificationInfo, error) {
	var info AbsenceJustificationInfo
	if err := r.infoQuery().Where("aj.id = ?", id).Scan(&info).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar justificativa de ausência", err)
	}
	if info.ID == 0 {
		return nil, apierrors.NotFoundError("Justificativa de ausência não encontrada", nil)
	}
	return &info, nil
}

func (r *absenceJustificationRepository) FindInfoByUserEmail(email string) (*AbsenceJustificationInfo, error) {
	var info AbsenceJustificationInfo
	if err := r.infoQuery().Where("aj.user_email = ?", email).Scan(&info).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar justificativa de ausência", err)
	}
	if info.ID == 0 {
		return nil, apierrors.NotFoundError("Justificativa de ausência não encontrada", nil)
	}
	return &info, nil
}

// UpdateStatus atualiza o status de uma justificativa. rejectionReason só deve ser
// não-nulo quando status="negado"; nos demais status deve vir nil para limpar o motivo.
func (r *absenceJustificationRepository) UpdateStatus(id uint, status string, rejectionReason *string) error {
	result := r.db.Model(&AbsenceJustification{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":           status,
		"rejection_reason": rejectionReason,
	})
	if result.Error != nil {
		return apierrors.InternalServerError("Erro ao atualizar status da justificativa de ausência", result.Error)
	}
	if result.RowsAffected == 0 {
		return apierrors.NotFoundError("Justificativa de ausência não encontrada", nil)
	}
	return nil
}
