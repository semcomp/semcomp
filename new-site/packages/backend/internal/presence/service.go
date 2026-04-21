package presence

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
)

var (
	ErrInvalidEventDate = errors.New("invalid event date format")
	ErrPresenceNotFound = errors.New("presence not found")
)

type PresenceService interface {
	CreatePresence(request CreatePresenceRequest) (*Presence, error)
	GetPresenceByNameEventandDate(name string, eventName string, dateTime string) (*Presence, error)
	DeletePresenceByNameEventandDate(name string, eventName string, dateTime string) error
	UpdatePresenceByNameEventandDate(name string, eventName string, dateTime string, request UpdatePresenceRequest) error
	GetPresences(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*PresenceListResult, error)
}

type presenceService struct {
	repo PresenceRepository
}

func NewPresenceService(repo PresenceRepository) PresenceService {
	return &presenceService{repo: repo}
}

func (s *presenceService) CreatePresence(request CreatePresenceRequest) (*Presence, error) {
	newPresence := Presence{
		Name:          request.Name,
		EventName:     request.EventName,
		EventDateTime: request.EventDateTime,
		EmailAdmin:    request.EmailAdmin,
	}

	err := s.repo.Create(&newPresence)
	if err != nil {
		return nil, err
	}
	return &newPresence, nil
}

func (s *presenceService) GetPresenceByNameEventandDate(name string, eventName string, dateTime string) (*Presence, error) {
	dateTimeParsed, err := time.Parse(time.RFC3339, dateTime)
	if err != nil {
		return nil, ErrInvalidEventDate
	}

	presence, err := s.repo.GetByNameEventandDate(name, eventName, dateTimeParsed)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPresenceNotFound
		}
		return nil, err
	}

	return presence, nil

}

func (s *presenceService) DeletePresenceByNameEventandDate(name string, eventName string, dateTime string) error {
	dateTimeParsed, err := time.Parse(time.RFC3339, dateTime)
	if err != nil {
		return ErrInvalidEventDate
	}
	err = s.repo.DeleteByNameEventandDate(name, eventName, dateTimeParsed)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPresenceNotFound
		}
		return err
	}

	return nil
}

func (s *presenceService) UpdatePresenceByNameEventandDate(name string, eventName string, dateTime string, request UpdatePresenceRequest) error {
	dateTimeParsed, err := time.Parse(time.RFC3339, dateTime)
	if err != nil {
		return ErrInvalidEventDate
	}

	updatePresence := Presence{
		Name:          request.Name,
		EventName:     request.EventName,
		EventDateTime: request.EventDateTime,
		EmailAdmin:    request.EmailAdmin,
	}

	err = s.repo.UpdateByNameEventandDate(name, eventName, dateTimeParsed, &updatePresence)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPresenceNotFound
		}
		return err
	}

	return nil
}

func (s *presenceService) GetPresences(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*PresenceListResult, error) {
	if page < 1 {
		return nil, fmt.Errorf("page must be greater than 0")
	}

	if limit < 1 {
		return nil, fmt.Errorf("limit must be greater than 0")
	}

	if sortBy == "" {
		sortBy = "event_date_time"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"name":            true,
		"event_name":      true,
		"event_date_time": true,
		"email_admin":     true,
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
			"name":            true,
			"event_name":      true,
			"email_admin":     true,
			"event_date_time": true,
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
	}

	offset := (page - 1) * limit
	query := PresenceListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetPresences(query)
}
