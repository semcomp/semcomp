package event

import (
	"fmt"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
)

type EventRepository interface {
	Create(event *Event) error
	GetByNameAndInitTime(name string, initTime time.Time) (*Event, error)
	DeleteByNameAndInitTime(name string, initTime time.Time) error
	UpdateByNameAndInitTime(name string, initTime time.Time, event *Event) error
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

func (r *eventRepository) GetByNameAndInitTime(name string, initTime time.Time) (*Event, error) {
	var event Event
	err := r.db.Raw(`
		SELECT e.name, e.init_date, e.end_date, e.presence_type_weight_id, e.type, e.location, e.description, e.has_attendance,
		       COALESCE(w.type_name, '') AS type_name
		FROM events e
		LEFT JOIN presence_type_weights w ON w.id = e.presence_type_weight_id
		WHERE e.name = ? AND e.init_date = ?
	`, name, initTime).Scan(&event).Error
	if err != nil {
		return nil, err
	}

	if event.Name == "" {
		return nil, gorm.ErrRecordNotFound
	}

	if event.PresenceTypeID != nil && event.TypeName != "" {
		event.Type = event.TypeName
	}

	return &event, nil
}

func (r *eventRepository) DeleteByNameAndInitTime(name string, initTime time.Time) error {
	result := r.db.Where("name = ? AND init_date = ?", name, initTime).Delete(&Event{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *eventRepository) UpdateByNameAndInitTime(name string, initTime time.Time, event *Event) error {
	result := r.db.Model(&Event{}).
		Where("name = ? AND init_date = ?", name, initTime).
		Updates(map[string]interface{}{
			"name":                   event.Name,
			"init_date":              event.InitDate,
			"end_date":               event.EndDate,
			"presence_type_weight_id": event.PresenceTypeID,
			"type":                   event.Type,
			"location":               event.Location,
			"description":            event.Description,
			"has_attendance":         event.HasAttendance,
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
		return dbQuery.Where("e.name ILIKE ?", "%"+query.SearchValue+"%")
	case "type":
		return dbQuery.Where("w.type_name ILIKE ? OR e.type ILIKE ?", "%"+query.SearchValue+"%", "%"+query.SearchValue+"%")
	case "location":
		return dbQuery.Where("e.location ILIKE ?", "%"+query.SearchValue+"%")
	case "description":
		return dbQuery.Where("e.description ILIKE ?", "%"+query.SearchValue+"%")
	case "init_date":
		return dbQuery.Where("e.init_date = ?", query.SearchValue)
	case "end_date":
		return dbQuery.Where("e.end_date = ?", query.SearchValue)
	case "has_attendance":
		return dbQuery.Where("e.has_attendance = ?", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"name",
		"init_date",
		"end_date",
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

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}

	sortMap := map[string]string{
		"name":           "e.name",
		"init_date":      "e.init_date",
		"end_date":       "e.end_date",
		"type":           "COALESCE(w.type_name, e.type)",
		"location":       "e.location",
		"description":    "e.description",
		"has_attendance": "e.has_attendance",
	}

	return sortMap[field] + " " + order, nil
}

func (r *eventRepository) GetEvents(query EventListQuery) (*EventListResult, error) {
	var events []Event
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	baseQuery := r.db.Table("events e").
		Select("e.name, e.init_date, e.end_date, e.presence_type_weight_id, e.type, e.location, e.description, e.has_attendance, COALESCE(w.type_name, '') AS type_name").
		Joins("LEFT JOIN presence_type_weights w ON w.id = e.presence_type_weight_id")

	if err := r.db.Raw("SELECT COUNT(*) FROM events").Scan(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(baseQuery, query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(baseQuery, query)

	var rawResults []struct {
		Name                string
		InitDate            time.Time
		EndDate             time.Time
		PresenceTypeWeightId *uint
		Type                string
		Location            string
		Description         string
		HasAttendance       bool
		TypeName            string
	}

	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Scan(&rawResults).Error
	if err != nil {
		return nil, err
	}

	events = make([]Event, len(rawResults))
	for i, r := range rawResults {
		events[i] = Event{
			Name:           r.Name,
			InitDate:       r.InitDate,
			EndDate:        r.EndDate,
			PresenceTypeID: r.PresenceTypeWeightId,
			TypeName:       r.TypeName,
			Type:           r.Type,
			Location:       r.Location,
			Description:    r.Description,
			HasAttendance:  r.HasAttendance,
		}
		if events[i].PresenceTypeID != nil && events[i].TypeName != "" {
			events[i].Type = events[i].TypeName
		}
	}

	return &EventListResult{
		Events:          events,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}
