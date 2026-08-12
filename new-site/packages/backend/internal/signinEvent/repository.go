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
	CountByStatus(eventName string, initDate time.Time, status RegistrationStatus) (int64, error)
	CountActiveByEvent(eventName string, initDate time.Time) (int64, error)
	FindActiveByUser(userNumber uint) ([]SigninEventsDetailed, error)
	UpdateStatus(userNumber uint, eventName string, initDate time.Time, status RegistrationStatus) error
	GetFirstWaitListed(eventName string, initDate time.Time) (*SigninEvent, error)
	PromoteToRegistered(userNumber uint, eventName string, initDate time.Time) error
	UpdateByComposite(userNumber uint, eventName string, initDate time.Time, updated *SigninEvent) error
	DeleteByComposite(userNumber uint, eventName string, initDate time.Time) error
	GetAll(query SigninEventListQuery) (*SigninEventListResult, error)
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

func (r *signinEventRepository) CountByStatus(eventName string, initDate time.Time, status RegistrationStatus) (int64, error) {
	var count int64
	err := r.db.Model(&SigninEvent{}).
		Where("event_name = ? AND event_init_date = ? AND status = ?", eventName, initDate, status).
		Count(&count).Error
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *signinEventRepository) CountActiveByEvent(eventName string, initDate time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&SigninEvent{}).
		Where("event_name = ? AND event_init_date = ? AND status <> ?", eventName, initDate, StatusCancelled).
		Count(&count).Error
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *signinEventRepository) FindActiveByUser(userNumber uint) ([]SigninEventsDetailed, error) {
	var signins []SigninEventsDetailed

	err := r.db.Table("signin_events").
		Select("signin_events.user_number, signin_events.event_name, signin_events.event_init_date, " +
			"events.end_date AS event_end_date, events.type AS event_type, events.location AS event_location, " +
			"events.description AS event_description, signin_events.user_wait_list_position, signin_events.status").
		Joins("JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date").
		Where("signin_events.user_number = ? AND signin_events.status <> ?", userNumber, StatusCancelled).
		Order("signin_events.event_init_date asc").
		Scan(&signins).Error
	if err != nil {
		return nil, err
	}

	return signins, nil
}

func (r *signinEventRepository) UpdateStatus(userNumber uint, eventName string, initDate time.Time, status RegistrationStatus) error {
	result := r.db.Model(&SigninEvent{}).
		Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).
		Update("status", status)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
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
	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&signins).Error
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
		return dbQuery.Where("event_init_date = ?", parsedTime)
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

func (r *signinEventRepository) GetFirstWaitListed(eventName string, initDate time.Time) (*SigninEvent, error) {
	var signin SigninEvent
	err := r.db.Where("event_name = ? AND event_init_date = ? AND status = ?", eventName, initDate, StatusWaitListed).
		Order("user_wait_list_position asc").
		First(&signin).Error
	if err != nil {
		return nil, err
	}

	return &signin, nil
}

func (r *signinEventRepository) PromoteToRegistered(userNumber uint, eventName string, initDate time.Time) error {
	result := r.db.Model(&SigninEvent{}).
		Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).
		Updates(map[string]interface{}{
			"status":                 StatusRegistered,
			"user_wait_list_position": 0,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}