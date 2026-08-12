package signinEvent

import (
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