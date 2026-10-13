package event

import (
	"fmt"
	"slices"
	"strings"
	"time"

	"backend/internal/database"

	"gorm.io/gorm"
)

type EventRepository interface {
	Create(event *Event) error
	GetByNameAndInitTime(name string, initTime time.Time) (*Event, error)
	DeleteByNameAndInitTime(name string, initTime time.Time) error
	UpdateByNameAndInitTime(name string, initTime time.Time, event *Event) error
	GetEvents(query EventListQuery) (*EventListResult, error)
	ListSigninableEvents() ([]Event, error)
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
		SELECT e.name, e.init_date, e.end_date, e.presence_type_weight_id, e.type, e.location, e.description, e.has_attendance, e.has_signin, e.max_participants,
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
			"has_signin":             event.HasSignin,
			"max_participants":       event.MaxParticipants,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

// eventSearchDateFormats são os formatos aceitos ao filtrar eventos por data.
// `hasTime` indica se o formato carrega hora: quando o usuário digita só a data
// o filtro cobre o dia inteiro; quando digita a hora, cobre aquele horário
// exato (até o minuto). Os formatos cobrem AAAA-MM-DD, o datetime-local do
// navegador e o formato brasileiro (DD/MM/AAAA) que aparece na tabela.
var eventSearchDateFormats = []struct {
	layout  string
	hasTime bool
}{
	{"2006-01-02", false},
	{"02/01/2006", false},
	{"2006-01-02 15:04", true},
	{"2006-01-02T15:04", true},
	{"2006-01-02T15:04:05", true},
	{"02/01/2006 15:04", true},
	{time.RFC3339, true},
}

// parseEventSearchDate converte o valor digitado no filtro de data em time.Time.
// Retorna false quando o valor não é uma data válida, para a camada de serviço
// responder 400 em vez de deixar o Postgres estourar erro de sintaxe.
func parseEventSearchDate(value string) (parsed time.Time, hasTime bool, ok bool) {
	value = strings.TrimSpace(value)
	for _, format := range eventSearchDateFormats {
		if t, err := time.Parse(format.layout, value); err == nil {
			return t, format.hasTime, true
		}
	}
	return time.Time{}, false, false
}

// eventDateCondition monta o WHERE do filtro de data. Compara sempre no fuso do
// app (não no da sessão UTC): um evento à noite em São Paulo tem dia UTC
// posterior ao que aparece na tela, e sem a conversão o filtro não acha o evento
// que o usuário está vendo. O valor vai como string (não time.Time) para não
// depender do fuso da sessão. `column` é sempre um literal fixo do chamador.
//
//   - só data (hasTime=false) → cobre o dia inteiro
//   - data + hora (hasTime=true) → cobre o horário exato, até o minuto
func eventDateCondition(dbQuery *gorm.DB, column string, parsed time.Time, hasTime bool) *gorm.DB {
	if hasTime {
		return dbQuery.Where(
			"date_trunc('minute', "+column+" AT TIME ZONE ?) = ?::timestamp",
			database.AppTimezone, parsed.Format("2006-01-02 15:04:00"),
		)
	}
	return dbQuery.Where(
		"DATE("+column+" AT TIME ZONE ?) = DATE(?)",
		database.AppTimezone, parsed.Format("2006-01-02"),
	)
}

func applySearchFilter(dbQuery *gorm.DB, query EventListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "name":
		return dbQuery.Where("unaccent(e.name) ILIKE unaccent(?)", "%"+query.SearchValue+"%")
	case "type":
		return dbQuery.Where("unaccent(w.type_name) ILIKE unaccent(?) OR unaccent(e.type) ILIKE unaccent(?)", "%"+query.SearchValue+"%", "%"+query.SearchValue+"%")
	case "location":
		return dbQuery.Where("unaccent(e.location) ILIKE unaccent(?)", "%"+query.SearchValue+"%")
	case "description":
		return dbQuery.Where("unaccent(e.description) ILIKE unaccent(?)", "%"+query.SearchValue+"%")
	case "init_date":
		parsed, hasTime, ok := parseEventSearchDate(query.SearchValue)
		if !ok {
			return dbQuery.Where("1 = 0")
		}
		return eventDateCondition(dbQuery, "e.init_date", parsed, hasTime)
	case "end_date":
		parsed, hasTime, ok := parseEventSearchDate(query.SearchValue)
		if !ok {
			return dbQuery.Where("1 = 0")
		}
		return eventDateCondition(dbQuery, "e.end_date", parsed, hasTime)
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
		Select("e.name, e.init_date, e.end_date, e.presence_type_weight_id, e.type, e.location, e.description, e.has_attendance, e.has_signin, e.max_participants, COALESCE(w.type_name, '') AS type_name").
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
		HasSignin           bool
		MaxParticipants     uint
		TypeName            string
	}

	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Scan(&rawResults).Error
	if err != nil {
		return nil, err
	}

	events = make([]Event, len(rawResults))
	for i, r := range rawResults {
		events[i] = Event{
			Name:            r.Name,
			InitDate:        r.InitDate,
			EndDate:         r.EndDate,
			PresenceTypeID:  r.PresenceTypeWeightId,
			TypeName:        r.TypeName,
			Type:            r.Type,
			Location:        r.Location,
			Description:     r.Description,
			HasAttendance:   r.HasAttendance,
			HasSignin:       r.HasSignin,
			MaxParticipants: r.MaxParticipants,
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

func (r *eventRepository) ListSigninableEvents() ([]Event, error) {
	var events []Event
	err := r.db.Where("has_signin = ?", true).
		Order("init_date asc").
		Find(&events).Error
	if err != nil {
		return nil, err
	}

	return events, nil
}
