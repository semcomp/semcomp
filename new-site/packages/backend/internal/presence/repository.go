package presence

import (
	"fmt"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
)

type PresenceRepository interface {
	Create(presence *Presence) error
	GetByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time) (*Presence, error)
	DeleteByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time) error
	UpdateByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time, updatedPresence *Presence) error
	GetPresences(query PresenceListQuery) (*PresenceListResult, error)
}

type presenceRepository struct {
	db *gorm.DB
}

func NewPresenceRepository(db *gorm.DB) PresenceRepository {
	return &presenceRepository{db: db}
}

func (r *presenceRepository) Create(presence *Presence) error {
	return r.db.Create(presence).Error
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
