package event

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

var (
	ErrInvalidEventDate = errors.New("invalid event date format")
	ErrEventNotFound    = errors.New("event not found")
)

type EventService interface {
	CreateEvent(request CreateEventRequest) (*Event, error)
	GetEventByNameAndDate(name string, date string) (*Event, error)
	DeleteEventByNameAndDate(name string, date string) error
	UpdateEventByNameAndDate(name string, date string, request UpdateEventRequest) (*Event, error)
	GetAllEvents(page int, limit int) ([]Event, error)
}

type eventService struct {
	repo EventRepository
}

func NewEventService(repo EventRepository) EventService {
	return &eventService{repo: repo}
}

func (s *eventService) CreateEvent(request CreateEventRequest) (*Event, error) {
	newEvent := Event{
		Name:          request.Name,
		DateTime:      request.DateTime,
		Type:          request.Type,
		Location:      request.Location,
		Description:   request.Description,
		HasAttendance: request.HasAttendance,
	}

	if err := s.repo.Create(&newEvent); err != nil {
		return nil, err
	}

	return &newEvent, nil
}

func (s *eventService) GetEventByNameAndDate(name string, date string) (*Event, error) {
	dateTime, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return nil, ErrInvalidEventDate
	}

	event, err := s.repo.GetByNameAndDateTime(name, dateTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	return event, nil
}

func (s *eventService) DeleteEventByNameAndDate(name string, date string) error {
	dateTime, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return ErrInvalidEventDate
	}

	err = s.repo.DeleteByNameAndDateTime(name, dateTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrEventNotFound
		}
		return err
	}

	return nil
}

func (s *eventService) UpdateEventByNameAndDate(name string, date string, request UpdateEventRequest) (*Event, error) {
	originalDateTime, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return nil, ErrInvalidEventDate
	}

	event := Event{
		Name:          request.Name,
		DateTime:      request.DateTime,
		Type:          request.Type,
		Location:      request.Location,
		Description:   request.Description,
		HasAttendance: request.HasAttendance,
	}

	err = s.repo.UpdateByNameAndDateTime(name, originalDateTime, &event)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	return &event, nil
}

func (s *eventService) GetAllEvents(page int, limit int) ([]Event, error) {
	if page < 1 {
		return nil, fmt.Errorf("page must be greater than 0")
	}

	if limit < 1 {
		return nil, fmt.Errorf("limit must be greater than 0")
	}

	offset := (page - 1) * limit
	return s.repo.GetAll(limit, offset)
}
