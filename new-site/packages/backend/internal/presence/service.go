package presence

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

var (
	ErrInvalidEventDate  = errors.New("invalid event date format")
	ErrPresenceNotFound  = errors.New("presence not found")
	ErrInvalidUserNumber = errors.New("invalid user number")
)

type PresenceService interface {
	CreatePresence(request CreatePresenceRequest) (*Presence, error)
	GetPresenceByUserEventandInitDate(userNumber string, eventName string, initDate string) (*Presence, error)
	DeletePresenceByUserEventandInitDate(userNumber string, eventName string, initDate string) error
	UpdatePresenceByUserEventandInitDate(userNumber string, eventName string, initDate string, request UpdatePresenceRequest) error
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
		UserNumber:    request.UserNumber,
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

func (s *presenceService) GetPresenceByUserEventandInitDate(userNumber string, eventName string, initDate string) (*Presence, error) {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return nil, ErrInvalidEventDate
	}

	num, err := strconv.ParseInt(userNumber, 10, 64)
	if err != nil {
		return nil, ErrInvalidUserNumber
	}

	presence, err := s.repo.GetByUserEventandInitDate(num, eventName, initDateParsed)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPresenceNotFound
		}
		return nil, err
	}

	return presence, nil

}

func (s *presenceService) DeletePresenceByUserEventandInitDate(userNumber string, eventName string, initDate string) error {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return ErrInvalidEventDate
	}

	num, err := strconv.ParseInt(userNumber, 10, 64)
	if err != nil {
		return ErrInvalidUserNumber
	}

	err = s.repo.DeleteByUserEventandInitDate(num, eventName, initDateParsed)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPresenceNotFound
		}
		return err
	}

	return nil
}

func (s *presenceService) UpdatePresenceByUserEventandInitDate(userNumber string, eventName string, initDate string, request UpdatePresenceRequest) error {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return ErrInvalidEventDate
	}

	num, err := strconv.ParseInt(userNumber, 10, 64)
	if err != nil {
		return ErrInvalidUserNumber
	}

	updatePresence := Presence{
		UserNumber:    request.UserNumber,
		EventName:     request.EventName,
		EventInitDate: initDateParsed,
		EmailAdmin:    request.EmailAdmin,
	}

	err = s.repo.UpdateByUserEventandInitDate(num, eventName, initDateParsed, &updatePresence)
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
		sortBy = "event_init_date"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"user_number":      true,
		"event_name":       true,
		"event_init_date":  true,
		"email_admin":      true,
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
			"user_number":      true,
			"event_name":       true,
			"email_admin":      true,
			"event_init_date":  true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("invalid search_by parameter")
		}

		if searchBy == "event_init_date" {
			parsedDateTime, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, fmt.Errorf("invalid search_value for event_init_date, use RFC3339")
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
