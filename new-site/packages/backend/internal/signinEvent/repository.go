package signinEvent

import (
	"time"

	"gorm.io/gorm"
)

type SigninEventRepository interface {
	Create(signinEvent *SigninEvent) error
	FindActiveByUser(userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error)
	ListByEvent(eventName string, initDate time.Time) ([]SigninEvent, error)
	CountByStatus(eventName string, initDate time.Time, status RegistrationStatus) (int64, error)
}

type signinEventRepository struct {
	db *gorm.DB
}

func NewSigninEventRepository(db *gorm.DB) SigninEventRepository {
	return &signinEventRepository{db: db}
}

func (r *signinEventRepository) Create(signinEvent *SigninEvent) error {
	return r.db.Create(signinEvent).Error
}

// FindActiveByUser retorna uma inscrição ativa de um usuário em um evento específico, se existir.
func (r *signinEventRepository) FindActiveByUser(userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error) {
	var signinEvent SigninEvent
	err := r.db.
		Where("user_number = ? AND event_name = ? AND event_init_date = ? AND status != ?", userNumber, eventName, initDate, StatusCancelled).
		First(&signinEvent).Error
	if err != nil {
		return nil, err
	}
	return &signinEvent, nil
}

// ListByEvent retorna todas as inscrições ativas em um evento específico.
func (r *signinEventRepository) ListByEvent(eventName string, initDate time.Time) ([]SigninEvent, error) {
	var signinEvents []SigninEvent
	err := r.db.
		Where("event_name = ? AND event_init_date = ? AND status != ?", eventName, initDate, StatusCancelled).
		Find(&signinEvents).Error
	if err != nil {
		return nil, err
	}
	return signinEvents, nil
}

// CountByStatus conta registros de inscrição de um status específico.
// (Para garantir que a quantidade de inscritos não ultrapasse o limite de vagas do evento)
func (r *signinEventRepository) CountByStatus(eventName string, initDate time.Time, status RegistrationStatus) (int64, error) {
	var count int64
	err := r.db.Model(&SigninEvent{}).
		Where("event_name = ? AND event_init_date = ? AND status = ?", eventName, initDate, status).
		Count(&count).Error
	return count, err
}
