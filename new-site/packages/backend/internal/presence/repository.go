package presence

import (
	"fmt"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
)

type PresenceRepository interface {
	// SetRateRecalculatorTx injeta o recalculador transacional usado por
	// DeleteAtomic e ClearByUserEventAtomic.
	SetRateRecalculatorTx(calculator RateRecalculatorTx)
	Create(presence *Presence) error
	GetByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time) (*Presence, error)
	DeleteByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time) error
	// DeleteAtomic remove a presença E recalcula a taxa do usuário na mesma
	// transação. É o caminho da API (DELETE /admin/presences).
	DeleteAtomic(userNumber int64, eventName string, initDate time.Time) error
	// ClearByUserEventAtomic remove a presença do usuário no evento, se existir,
	// recalculando a taxa na mesma transação. Usado quando a inscrição é
	// cancelada — sem ele a presença fica órfã e ainda credita o peso do evento.
	// Não é erro se não houver presença.
	ClearByUserEventAtomic(userNumber int64, eventName string, initDate time.Time) error
	UpdateByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time, updatedPresence *Presence) error
	GetPresences(query PresenceListQuery) (*PresenceListResult, error)
}

type presenceRepository struct {
	db         *gorm.DB
	calculator RateRecalculatorTx
}

func NewPresenceRepository(db *gorm.DB) PresenceRepository {
	return &presenceRepository{db: db}
}

// SetRateRecalculatorTx injeta o recalculador transacional. Chamado no main com
// o mesmo presencerate.Calculator usado pelo service.
func (r *presenceRepository) SetRateRecalculatorTx(calculator RateRecalculatorTx) {
	r.calculator = calculator
}

func (r *presenceRepository) Create(presence *Presence) error {
	return r.db.Create(presence).Error
}

// recalcTx delega o recálculo para o calculador injetado. Sem calculador, é
// no-op — mantém o repositório utilizável em testes sem a dependência.
func (r *presenceRepository) recalcTx(tx *gorm.DB, userNumber int64) error {
	if r.calculator == nil {
		return nil
	}
	return r.calculator.RecalculateUsersTx(tx, userNumber)
}

// DeleteAtomic remove a presença e recalcula a taxa do usuário na MESMA
// transação. Sem isso, o DELETE commita e o recálculo pode falhar depois,
// deixando a linha removida e `users.presence_rate` desatualizado — o mesmo
// motivo pelo qual sales.CancelWithRelease une as duas operações.
func (r *presenceRepository) DeleteAtomic(userNumber int64, eventName string, initDate time.Time) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		result := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).Delete(&Presence{})
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}
		return r.recalcTx(tx, userNumber)
	})
}

// ClearByUserEventAtomic remove a presença do usuário no evento (se houver) e
// recalcula a taxa na mesma transação. Idempotente: ausência de presença não é
// erro — o cancelamento da inscrição deve prosseguir mesmo assim.
func (r *presenceRepository) ClearByUserEventAtomic(userNumber int64, eventName string, initDate time.Time) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		result := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).Delete(&Presence{})
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return nil // nada a limpar
		}
		return r.recalcTx(tx, userNumber)
	})
}

func (r *presenceRepository) GetByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time) (*Presence, error) {
	var presence Presence
	err := r.db.Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).First(&presence).Error
	if err != nil {
		return nil, err
	}

	return &presence, nil
}

func (r *presenceRepository) DeleteByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time) error {
	result := r.db.Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).Delete(&Presence{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *presenceRepository) UpdateByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time, updatedPresence *Presence) error {
	result := r.db.Model(&Presence{}).
		Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).
		Updates(map[string]interface{}{
			"user_number":     updatedPresence.UserNumber,
			"event_name":      updatedPresence.EventName,
			"event_init_date": updatedPresence.EventInitDate,
			"email_admin":     updatedPresence.EmailAdmin,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *presenceRepository) GetPresences(query PresenceListQuery) (*PresenceListResult, error) {
	var presences []Presence
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Presence{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredList := applySearchFilter(r.db.Model(&Presence{}), query)
	if err := filteredList.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&Presence{}), query)
	if err := dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&presences).Error; err != nil {
		return nil, err
	}

	return &PresenceListResult{
		Presences:       presences,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

func applySearchFilter(dbQuery *gorm.DB, query PresenceListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "user_number":
		// user_number is stored as bigint; cast to text to allow partial matching
		return dbQuery.Where("user_number::text ILIKE ?", "%"+query.SearchValue+"%")
	case "event_name":
		return dbQuery.Where("event_name ILIKE ?", "%"+query.SearchValue+"%")
	case "email_admin":
		return dbQuery.Where("email_admin ILIKE ?", "%"+query.SearchValue+"%")
	case "event_init_date":
		parsedTime, _ := time.Parse(time.RFC3339, query.SearchValue)
		return dbQuery.Where("event_init_date = ?", parsedTime)
	case "created_at":
		// O value chega normalizado como AAAA-MM-DD pelo service. Compara no fuso
		// do app (banco em UTC) para o dia bater com o exibido na tabela.
		return dbQuery.Where("DATE(created_at AT TIME ZONE 'America/Sao_Paulo') = DATE(?)", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"user_number",
		"event_name",
		"event_init_date",
		"email_admin",
		"created_at",
	}

	field := strings.ToLower(sortBy)
	isAllowedField := slices.Contains(allowedSortFields, field)
	if !isAllowedField {
		return "", fmt.Errorf("invalid sort field")
	}

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}

	return field + " " + order, nil
}
