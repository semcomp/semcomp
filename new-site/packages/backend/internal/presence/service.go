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
	GetPresenceByNameEventandInitDate(name string, eventName string, initDate string) (*Presence, error)
	DeletePresenceByNameEventandInitDate(name string, eventName string, initDate string) error
	UpdatePresenceByNameEventandInitDate(name string, eventName string, initDate string, request UpdatePresenceRequest) error
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
		EventInitDate: request.EventInitDate,
		EmailAdmin:    request.EmailAdmin,
	}

	err := s.repo.Create(&newPresence)
	if err != nil {
		return nil, err
	}
	return &newPresence, nil
}

func (s *presenceService) GetPresenceByNameEventandInitDate(name string, eventName string, initDate string) (*Presence, error) {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return nil, ErrInvalidEventDate
	}

	presence, err := s.repo.GetByNameEventandInitDate(name, eventName, initDateParsed)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPresenceNotFound
		}
		return nil, err
	}

	return presence, nil

}

func (s *presenceService) DeletePresenceByNameEventandInitDate(name string, eventName string, initDate string) error {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return ErrInvalidEventDate
	}
	err = s.repo.DeleteByNameEventandInitDate(name, eventName, initDateParsed)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPresenceNotFound
		}
		return err
	}

	return nil
}

func (s *presenceService) UpdatePresenceByNameEventandInitDate(name string, eventName string, initDate string, request UpdatePresenceRequest) error {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return ErrInvalidEventDate
	}

	updatePresence := Presence{
		Name:          request.Name,
		EventName:     request.EventName,
		EventInitDate: initDateParsed,
		EmailAdmin:    request.EmailAdmin,
	}

	err = s.repo.UpdateByNameEventandInitDate(name, eventName, initDateParsed, &updatePresence)
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
		return nil, fmt.Errorf("Page deve ser maior que 0")
	}

	if limit < 1 {
		return nil, fmt.Errorf("Limit deve ser maior que 0")
	}

	if sortBy == "" {
		sortBy = "event_init_date"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"name":            true,
		"event_name":      true,
		"event_init_date": true,
		"email_admin":     true,
	}

	if !allowedSortFields[sortBy] {
		return nil, fmt.Errorf("Parâmetro 'sort_by' inválido")
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, fmt.Errorf("Parâmetro 'sort_order' inválido")
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, fmt.Errorf("Parâmetro 'search_by' e 'search_value' devem ser fornecidos juntos")
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"name":            true,
			"event_name":      true,
			"email_admin":     true,
			"event_init_date": true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("Parâmetro 'search_by' inválido")
		}

		if searchBy == "event_init_date" {
			parsedDateTime, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, fmt.Errorf("Parâmetro 'search_value' inválido para 'event_init_date', use o formato RFC3339")
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
