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
)

type EventService interface {
	CreateEvent(request CreateEventRequest) (*Event, error)
	GetEventByNameAndDate(name string, date string) (*Event, error)
	DeleteEventByNameAndDate(name string, date string) error
	UpdateEventByNameAndDate(name string, date string, request UpdateEventRequest) (*Event, error)
	GetEvents(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*EventListResult, error)
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

func (s *eventService) GetEvents(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*EventListResult, error) {
	if page < 1 {
		return nil, fmt.Errorf("page must be greater than 0")
	}

	if limit < 1 {
		return nil, fmt.Errorf("limit must be greater than 0")
	}

	if sortBy == "" {
		sortBy = "date_time"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"name":           true,
		"date_time":      true,
		"type":           true,
		"location":       true,
		"description":    true,
		"has_attendance": true,
	}

	if !allowedSortFields[sortBy] {
		return nil, fmt.Errorf("invalid sort_by parameter")
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, fmt.Errorf("invalid sort_order parameter")
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, fmt.Errorf("search_by and search_value must be provided together")
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"name":           true,
			"type":           true,
			"location":       true,
			"description":    true,
			"date_time":      true,
			"has_attendance": true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("invalid search_by parameter")
		}

		if searchBy == "date_time" {
			parsedDateTime, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, fmt.Errorf("invalid search_value for date_time, use RFC3339")
			}
			searchValue = parsedDateTime.Format(time.RFC3339)
		}

		if searchBy == "has_attendance" {
			if _, err := strconv.ParseBool(searchValue); err != nil {
				return nil, fmt.Errorf("invalid search_value for has_attendance")
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
