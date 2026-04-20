package event

import (
	"fmt"
	"strings"
	"time"
	"slices"

	"gorm.io/gorm"
)

type EventRepository interface {
	Create(event *Event) error
	GetByNameAndDateTime(name string, dateTime time.Time) (*Event, error)
	DeleteByNameAndDateTime(name string, dateTime time.Time) error
	UpdateByNameAndDateTime(name string, dateTime time.Time, event *Event) error
	GetEvents(query EventListQuery) (*EventListResult, error)
}

type eventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) EventRepository {
	return &eventRepository{db: db}
}

func (r *eventRepository) Create(event *Event) error {
	return r.db.Create(event).Error
}

func (r *eventRepository) GetByNameAndDateTime(name string, dateTime time.Time) (*Event, error) {
	var event Event
	err := r.db.Where("name = ? AND date_time = ?", name, dateTime).First(&event).Error
	if err != nil {
		return nil, err
	}

	return &event, nil
}

func (r *eventRepository) DeleteByNameAndDateTime(name string, dateTime time.Time) error {
	result := r.db.Where("name = ? AND date_time = ?", name, dateTime).Delete(&Event{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *eventRepository) UpdateByNameAndDateTime(name string, dateTime time.Time, event *Event) error {
	result := r.db.Model(&Event{}).
		Where("name = ? AND date_time = ?", name, dateTime).
		Updates(map[string]interface{}{
			"name":           event.Name,
			"date_time":      event.DateTime,
			"type":           event.Type,
			"location":       event.Location,
			"description":    event.Description,
			"has_attendance": event.HasAttendance,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func applySearchFilter(dbQuery *gorm.DB, query EventListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "name":
		return dbQuery.Where("name ILIKE ?", "%"+query.SearchValue+"%")
	case "type":
		return dbQuery.Where("type ILIKE ?", "%"+query.SearchValue+"%")
	case "location":
		return dbQuery.Where("location ILIKE ?", "%"+query.SearchValue+"%")
	case "description":
		return dbQuery.Where("description ILIKE ?", "%"+query.SearchValue+"%")
	case "date_time":
		return dbQuery.Where("date_time = ?", query.SearchValue)
	case "has_attendance":
		return dbQuery.Where("has_attendance = ?", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"name",
		"date_time",
		"type",
		"location",
		"description",
		"has_attendance",
	}

	field := strings.ToLower(sortBy)
	isAllowedField := slices.Contains(allowedSortFields, field)
	if !isAllowedField {
		return "", fmt.Errorf("invalid sort field")
	}

	if !isAllowedField {
		return "", fmt.Errorf("invalid sort field")
	}

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}

	return field + " " + order, nil
}

func (r *eventRepository) GetEvents(query EventListQuery) (*EventListResult, error) {
	var events []Event
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Event{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(r.db.Model(&Event{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&Event{}), query)
	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&events).Error
	if err != nil {
		return nil, err
	}

	return &EventListResult{
		Events:          events,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}
