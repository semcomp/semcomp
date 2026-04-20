package event

import (
	"time"

	"gorm.io/gorm"
)

type EventRepository interface {
	Create(event *Event) error
	GetByNameAndDateTime(name string, dateTime time.Time) (*Event, error)
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
