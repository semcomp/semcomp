package absenceJustification

import (
	"errors"
	"fmt"
	"slices"
	"strings"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type AbsenceJustificationListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type AbsenceJustificationListResult struct {
	Justifications  []AbsenceJustificationInfo `json:"absence_justifications"`
	TotalRecords    int64                       `json:"total_records"`
	FilteredRecords int64                       `json:"filtered_records"`
}

type AbsenceJustificationRepository interface {
	Create(justification *AbsenceJustification) error
	Update(justification *AbsenceJustification) error
	GetAll(query AbsenceJustificationListQuery) (*AbsenceJustificationListResult, error)
	FindAll() ([]AbsenceJustificationInfo, error)
	FindByID(id uint) (*AbsenceJustification, error)
	FindByUserEmail(email string) (*AbsenceJustification, error)
	FindInfoByID(id uint) (*AbsenceJustificationInfo, error)
	FindInfoByUserEmail(email string) (*AbsenceJustificationInfo, error)
	UpdateStatus(id uint, status string, rejectionReason *string) error
	FindUserNumberByEmail(email string) (int64, error)
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

func applyAJSearchFilter(dbQuery *gorm.DB, query AbsenceJustificationListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}
	switch query.SearchBy {
	case "user_name":
		return dbQuery.Where("u.name ILIKE ?", "%"+query.SearchValue+"%")
	case "event_name":
		return dbQuery.Where("aj.event_name ILIKE ?", "%"+query.SearchValue+"%")
	case "submitted_at":
		return dbQuery.Where("DATE(aj.submitted_at)::text ILIKE ?", "%"+query.SearchValue+"%")
	case "status":
		return dbQuery.Where("aj.status ILIKE ?", "%"+query.SearchValue+"%")
	}
	return dbQuery
}

func resolveAJSortClause(sortBy, sortOrder string) (string, error) {
	allowed := []string{"user_name", "event_name", "submitted_at", "status"}
	field := strings.ToLower(sortBy)
	if !slices.Contains(allowed, field) {
		return "", fmt.Errorf("invalid sort field")
	}
	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}
	columnMap := map[string]string{
		"user_name":    "u.name",
		"event_name":   "aj.event_name",
		"submitted_at": "aj.submitted_at",
		"status":       "aj.status",
	}
	return columnMap[field] + " " + order, nil
}

func (r *absenceJustificationRepository) GetAll(query AbsenceJustificationListQuery) (*AbsenceJustificationListResult, error) {
	var totalRecords int64
	var filteredRecords int64
	var results []AbsenceJustificationInfo

	sortClause, err := resolveAJSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, apierrors.ValidationError("Campo de ordenação inválido", err)
	}

	baseCount := r.db.Table("absence_justifications aj").
		Joins("JOIN users u ON u.email = aj.user_email")

	if err := baseCount.Count(&totalRecords).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao contar justificativas", err)
	}

	if err := applyAJSearchFilter(baseCount, query).Count(&filteredRecords).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao contar justificativas filtradas", err)
	}

	err = applyAJSearchFilter(r.infoQuery(), query).
		Order(sortClause).
		Limit(query.Limit).
		Offset(query.Offset).
		Scan(&results).Error
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao listar justificativas de ausência", err)
	}

	return &AbsenceJustificationListResult{
		Justifications:  results,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
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

// FindUserNumberByEmail encontra o user_number correspondente ao email na tabela users.
func (r *absenceJustificationRepository) FindUserNumberByEmail(email string) (int64, error) {
	var userNumber int64
	err := r.db.Raw("SELECT user_number FROM users WHERE email = ?", email).Scan(&userNumber).Error
	if err != nil {
		return 0, apierrors.InternalServerError("Erro ao buscar número do usuário", err)
	}
	if userNumber == 0 {
		return 0, apierrors.NotFoundError("Usuário não encontrado", nil)
	}
	return userNumber, nil
}
