package signinEvent

import (
	"fmt"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
)

type SigninEventRepository interface {
	Create(signin *SigninEvent) error
	GetByUserEventAndInitDate(userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error)
	CountActiveByEvent(eventName string, initDate time.Time) (int64, error)
	FindActiveByUser(userNumber uint) ([]SigninEventsDetailed, error)
	FindActiveOverlapping(userNumber uint, targetEventName string, targetInitDate time.Time, targetEndDate time.Time) (*SigninEvent, error)
	DecrementPositionsAfter(eventName string, initDate time.Time, deletedPosition uint) error
	PromoteWithinLimit(eventName string, initDate time.Time, max uint) error
	UpdateByComposite(userNumber uint, eventName string, initDate time.Time, updated *SigninEvent) error
	DeleteByComposite(userNumber uint, eventName string, initDate time.Time) error
	GetAll(query SigninEventListQuery) (*SigninEventListResult, error)
	DeleteByStatus(eventName string, initDate time.Time, status RegistrationStatus) error
	ListActiveByEvent(eventName string, initDate time.Time) ([]SigninEvent, error)
	PromoteFirstWaitListed(eventName string, initDate time.Time, limit int) error
	UpdatePosition(userNumber uint, eventName string, initDate time.Time, position uint) error
}

type signinEventRepository struct {
	db *gorm.DB
}

func NewSigninEventRepository(db *gorm.DB) SigninEventRepository {
	return &signinEventRepository{db: db}
}

func (r *signinEventRepository) Create(signin *SigninEvent) error {
	return r.db.Create(signin).Error
}

func (r *signinEventRepository) GetByUserEventAndInitDate(userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error) {
	var signin SigninEvent
	err := r.db.Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).First(&signin).Error
	if err != nil {
		return nil, err
	}

	return &signin, nil
}

func (r *signinEventRepository) CountActiveByEvent(eventName string, initDate time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&SigninEvent{}).
		Where("event_name = ? AND event_init_date = ?", eventName, initDate).
		Count(&count).Error
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *signinEventRepository) FindActiveByUser(userNumber uint) ([]SigninEventsDetailed, error) {
	var signins []SigninEventsDetailed

	err := r.db.Table("signin_events").
		Select("signin_events.user_number, signin_events.event_name, signin_events.event_init_date, "+
			"events.end_date AS event_end_date, events.type AS event_type, events.location AS event_location, "+
			"events.description AS event_description, "+
			"CASE WHEN signin_events.status = ? AND events.max_participants > 0 "+
			"AND signin_events.user_wait_list_position > events.max_participants "+
			"THEN signin_events.user_wait_list_position - events.max_participants "+
			"ELSE signin_events.user_wait_list_position END AS user_wait_list_position, "+
			"signin_events.status", StatusWaitListed).
		Joins("JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date").
		Where("signin_events.user_number = ?", userNumber).
		Order("signin_events.event_init_date asc").
		Scan(&signins).Error
	if err != nil {
		return nil, err
	}

	return signins, nil
}

func (r *signinEventRepository) FindActiveOverlapping(userNumber uint, targetEventName string, targetInitDate time.Time, targetEndDate time.Time) (*SigninEvent, error) {
	var results []SigninEvent
	err := r.db.Table("signin_events").
		Select("signin_events.*").
		Joins("JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date").
		Where("signin_events.user_number = ?", userNumber).
		// exclui a própria linha do evento-alvo (não é conflito consigo mesmo)
		Where("NOT (signin_events.event_name = ? AND signin_events.event_init_date = ?)", targetEventName, targetInitDate).
		// overlap: existente.init < alvo.end  AND  alvo.init < existente.end
		Where("events.init_date < ? AND ? < events.end_date", targetEndDate, targetInitDate).
		Limit(1).
		Scan(&results).Error
	if err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &results[0], nil
}

func (r *signinEventRepository) UpdateByComposite(userNumber uint, eventName string, initDate time.Time, updated *SigninEvent) error {
	result := r.db.Model(&SigninEvent{}).
		Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).
		Updates(map[string]interface{}{
			"user_number":             updated.UserNumber,
			"event_name":              updated.EventName,
			"event_init_date":         updated.EventInitDate,
			"user_wait_list_position": updated.UserWaitListPosition,
			"status":                  updated.Status,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *signinEventRepository) DeleteByComposite(userNumber uint, eventName string, initDate time.Time) error {
	result := r.db.Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).Delete(&SigninEvent{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *signinEventRepository) GetAll(query SigninEventListQuery) (*SigninEventListResult, error) {
	var signins []SigninEvent
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&SigninEvent{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(r.db.Model(&SigninEvent{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&SigninEvent{}), query)
	err = dataQuery.
		Select("signin_events.user_number, signin_events.event_name, signin_events.event_init_date, "+
			"CASE WHEN signin_events.status = ? AND events.max_participants > 0 "+
			"AND signin_events.user_wait_list_position > events.max_participants "+
			"THEN signin_events.user_wait_list_position - events.max_participants "+
			"ELSE signin_events.user_wait_list_position END AS user_wait_list_position, "+
			"signin_events.status", StatusWaitListed).
		Joins("LEFT JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date").
		Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&signins).Error
	if err != nil {
		return nil, err
	}

	return &SigninEventListResult{
		Signins:         signins,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

func applySearchFilter(dbQuery *gorm.DB, query SigninEventListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "user_number":
		return dbQuery.Where("user_number::text ILIKE ?", "%"+query.SearchValue+"%")
	case "event_name":
		return dbQuery.Where("event_name ILIKE ?", "%"+query.SearchValue+"%")
	case "event_init_date":
		parsedTime, _ := time.Parse(time.RFC3339, query.SearchValue)
		return dbQuery.Where("DATE(event_init_date) = DATE(?)", parsedTime)
	case "status":
		return dbQuery.Where("status ILIKE ?", "%"+query.SearchValue+"%")
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"user_number",
		"event_name",
		"event_init_date",
		"status",
		"user_wait_list_position",
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

func (r *signinEventRepository) DecrementPositionsAfter(eventName string, initDate time.Time, deletedPosition uint) error {
	return r.db.Model(&SigninEvent{}).
		Where("event_name = ? AND event_init_date = ? AND user_wait_list_position > ?", eventName, initDate, deletedPosition).
		Update("user_wait_list_position", gorm.Expr("user_wait_list_position - 1")).Error
}

func (r *signinEventRepository) PromoteWithinLimit(eventName string, initDate time.Time, max uint) error {
	if max == 0 {
		return nil
	}

	return r.db.Model(&SigninEvent{}).
		Where("event_name = ? AND event_init_date = ? AND status = ? AND user_wait_list_position <= ?",
			eventName, initDate, StatusWaitListed, max).
		Update("status", StatusWaitingDonation).Error
}

func (r *signinEventRepository) DeleteByStatus(eventName string, initDate time.Time, status RegistrationStatus) error {
	return r.db.Where("event_name = ? AND event_init_date = ? AND status = ?", eventName, initDate, status).
		Delete(&SigninEvent{}).Error
}

func (r *signinEventRepository) ListActiveByEvent(eventName string, initDate time.Time) ([]SigninEvent, error) {
	var signins []SigninEvent
	err := r.db.Where("event_name = ? AND event_init_date = ?", eventName, initDate).
		Order("user_wait_list_position asc").
		Find(&signins).Error
	if err != nil {
		return nil, err
	}

	return signins, nil
}

func (r *signinEventRepository) PromoteFirstWaitListed(eventName string, initDate time.Time, limit int) error {
	if limit <= 0 {
		return nil
	}

	sub := r.db.Model(&SigninEvent{}).
		Select("user_number").
		Where("event_name = ? AND event_init_date = ? AND status = ?", eventName, initDate, StatusWaitListed).
		Order("user_wait_list_position asc").
		Limit(limit)

	return r.db.Model(&SigninEvent{}).
		Where("event_name = ? AND event_init_date = ? AND status = ? AND user_number IN (?)",
			eventName, initDate, StatusWaitListed, sub).
		Update("status", StatusRegistered).Error
}

func (r *signinEventRepository) UpdatePosition(userNumber uint, eventName string, initDate time.Time, position uint) error {
	return r.db.Model(&SigninEvent{}).
		Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).
		Update("user_wait_list_position", position).Error
}
