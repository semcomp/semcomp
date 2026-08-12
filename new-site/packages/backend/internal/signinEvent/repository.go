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