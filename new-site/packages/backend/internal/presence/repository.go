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
	GetByNameEventandDate(name string, eventName string, dateTime time.Time) (*Presence, error)
	DeleteByNameEventandDate(name string, eventName string, dateTime time.Time) error
	UpdateByNameEventandDate(name string, eventName string, dateTime time.Time, updatedPresence *Presence) error
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

func (r *presenceRepository) GetByNameEventandDate(name string, eventName string, dateTime time.Time) (*Presence, error) {
	var presence Presence
	err := r.db.Where("name = ? AND event_name = ? AND event_date_time = ?", name, eventName, dateTime).First(&presence).Error
	if err != nil {
		return nil, err
	}

	return &presence, nil
}

func (r *presenceRepository) DeleteByNameEventandDate(name string, eventName string, dateTime time.Time) error {
	result := r.db.Where("name = ? AND event_name = ? AND event_date_time = ?", name, eventName, dateTime).Delete(&Presence{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *presenceRepository) UpdateByNameEventandDate(name string, eventName string, dateTime time.Time, updatedPresence *Presence) error {
	result := r.db.Model(&Presence{}).
		Where("name = ? AND event_name = ? AND event_date_time = ?", name, eventName, dateTime).
		Updates(map[string]interface{}{
			"name":            updatedPresence.Name,
			"event_name":      updatedPresence.EventName,
			"event_date_time": updatedPresence.EventDateTime,
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
	case "name":
		return dbQuery.Where("name ILIKE ?", "%"+query.SearchValue+"%")
	case "event_name":
		return dbQuery.Where("event_name ILIKE ?", "%"+query.SearchValue+"%")
	case "email_admin":
		return dbQuery.Where("email_admin ILIKE ?", "%"+query.SearchValue+"%")
	case "event_date_time":
		return dbQuery.Where("event_date_time = ?", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"name",
		"event_name",
		"event_date_time",
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
