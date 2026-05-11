package event

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

var (
	ErrInvalidEventDate = errors.New("invalid event date format")
	ErrEventNotFound    = errors.New("event not found")
	ErrEventConflict    = errors.New("event conflict")
)

type EventService interface {
	CreateEvent(request CreateEventRequest) (*Event, error)
	GetEventByNameAndInitDate(name string, date string) (*Event, error)
	DeleteEventByNameAndInitDate(name string, date string) error
	UpdateEventByNameAndInitDate(name string, date string, request UpdateEventRequest) (*Event, error)
	GetEvents(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*EventListResult, error)
}

type eventService struct {
	repo EventRepository
}

func NewEventService(repo EventRepository) EventService {
	return &eventService{repo: repo}
}

func (s *eventService) CreateEvent(request CreateEventRequest) (*Event, error) {
	if _, err := s.repo.GetByNameAndInitTime(request.Name, request.InitDate); err == nil {
		return nil, ErrEventConflict
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	newEvent := Event{
		Name:          request.Name,
		InitDate:      request.InitDate,
		EndDate:       request.EndDate,
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

func (s *eventService) GetEventByNameAndInitDate(name string, initDate string) (*Event, error) {
	initTime, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return nil, ErrInvalidEventDate
	}

	event, err := s.repo.GetByNameAndInitTime(name, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	return event, nil
}

func (s *eventService) DeleteEventByNameAndInitDate(name string, initDate string) error {
	initTime, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return ErrInvalidEventDate
	}

	err = s.repo.DeleteByNameAndInitTime(name, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrEventNotFound
		}
		return err
	}

	return nil
}

func (s *eventService) UpdateEventByNameAndInitDate(name string, initDate string, request UpdateEventRequest) (*Event, error) {
	originalInitTime, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return nil, ErrInvalidEventDate
	}

	if name != request.Name || !originalInitTime.Equal(request.InitDate) {
		if _, err := s.repo.GetByNameAndInitTime(request.Name, request.InitDate); err == nil {
			return nil, ErrEventConflict
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}

	event := Event{
		Name:          request.Name,
		InitDate:      request.InitDate,
		EndDate:       request.EndDate,
		Type:          request.Type,
		Location:      request.Location,
		Description:   request.Description,
		HasAttendance: request.HasAttendance,
	}

	err = s.repo.UpdateByNameAndInitTime(name, originalInitTime, &event)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	return &event, nil
}

func (s *eventService) GetEvents(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*EventListResult, error) {
	if page < 1 {
		return nil, fmt.Errorf("Page deve ser maior que 0")
	}

	if limit < 1 {
		return nil, fmt.Errorf("Limit deve ser maior que 0")
	}

	if sortBy == "" {
		sortBy = "init_date"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"name":           true,
		"init_date":      true,
		"type":           true,
		"location":       true,
		"description":    true,
		"has_attendance": true,
	}

	if !allowedSortFields[sortBy] {
		return nil, fmt.Errorf("Parametro 'sort_by' inválido")
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, fmt.Errorf("Parametro 'sort_order' inválido")
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, fmt.Errorf("Parametro 'search_by' e 'search_value' devem ser fornecidos juntos")
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"name":           true,
			"init_date":      true,
			"type":           true,
			"location":       true,
			"description":    true,
			"has_attendance": true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("Parametro 'search_by' inválido")
		}

		if searchBy == "init_date" {
			parsedInitDate, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, fmt.Errorf("Parametro 'search_value' inválido para init_date, use RFC3339")
			}
			searchValue = parsedInitDate.Format(time.RFC3339)
		}

		if searchBy == "has_attendance" {
			if _, err := strconv.ParseBool(searchValue); err != nil {
				return nil, fmt.Errorf("Parametro 'search_value' inválido para has_attendance")
			}
		}
	}

	offset := (page - 1) * limit
	query := EventListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetEvents(query)
}
