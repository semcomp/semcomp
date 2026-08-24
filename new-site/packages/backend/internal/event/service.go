package event

import (
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type EventService interface {
	SetRateRecalculator(recalculator RateRecalculator)
	CreateEvent(request CreateEventRequest) (*Event, error)
	GetEventByNameAndInitDate(name string, date string) (*Event, error)
	DeleteEventByNameAndInitDate(name string, date string) error
	UpdateEventByNameAndInitDate(name string, date string, request UpdateEventRequest) (*Event, error)
	GetEvents(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*EventListResult, error)
}

// RateRecalculator dispara o recálculo global das taxas de presença quando a
// agenda de eventos muda (datas, tipos ou disponibilidade de presença).
type RateRecalculator interface {
	RecalculateAll() error
}

type eventService struct {
	repo         EventRepository
	recalculator RateRecalculator
}

func NewEventService(repo EventRepository) EventService {
	return &eventService{repo: repo}
}

func (s *eventService) SetRateRecalculator(recalculator RateRecalculator) {
	s.recalculator = recalculator
}

func (s *eventService) recalculateAll() {
	if s.recalculator == nil {
		return
	}
	if err := s.recalculator.RecalculateAll(); err != nil {
		log.Printf("[event] erro ao recalcular taxas de presença: %v", err)
	}
}

func (s *eventService) CreateEvent(request CreateEventRequest) (*Event, error) {
	if _, err := s.repo.GetByNameAndInitTime(request.Name, request.InitDate); err == nil {
		return nil, apierrors.ConflictError("Evento já existe", err)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar evento já existente", err)
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
		return nil, apierrors.InternalServerError("Erro ao criar evento", err)
	}

	s.recalculateAll()

	return &newEvent, nil
}

func (s *eventService) GetEventByNameAndInitDate(name string, initDate string) (*Event, error) {
	initTime, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return nil, apierrors.ValidationError("Data inválida. Use o formato RFC3339", err)
	}

	event, err := s.repo.GetByNameAndInitTime(name, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Evento não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar evento", err)
	}

	return event, nil
}

func (s *eventService) DeleteEventByNameAndInitDate(name string, initDate string) error {
	initTime, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return apierrors.ValidationError("Data inválida. Use o formato RFC3339", err)
	}

	err = s.repo.DeleteByNameAndInitTime(name, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Evento não encontrado", err)
		}
		return apierrors.InternalServerError("Erro ao remover evento", err)
	}

	s.recalculateAll()

	return nil
}

func (s *eventService) UpdateEventByNameAndInitDate(name string, initDate string, request UpdateEventRequest) (*Event, error) {
	originalInitTime, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return nil, apierrors.ValidationError("Data inválida. Use o formato RFC3339", err)
	}

	if name != request.Name || !originalInitTime.Equal(request.InitDate) {
		if _, err := s.repo.GetByNameAndInitTime(request.Name, request.InitDate); err == nil {
			return nil, apierrors.ConflictError("Evento já existe", err)
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.InternalServerError("Erro ao verificar evento já existente", err)
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
			return nil, apierrors.NotFoundError("Evento não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar evento", err)
	}

	s.recalculateAll()

	return &event, nil
}

func (s *eventService) GetEvents(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*EventListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}

	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
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
		"end_date":       true,
		"type":           true,
		"location":       true,
		"description":    true,
		"has_attendance": true,
	}

	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parametro 'sort_by' inválido", nil)
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("Parametro 'sort_order' inválido", nil)
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("Parametro 'search_by' e 'search_value' devem ser fornecidos juntos", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"name":           true,
			"init_date":      true,
			"end_date":       true,
			"type":           true,
			"location":       true,
			"description":    true,
			"has_attendance": true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parametro 'search_by' inválido", nil)
		}

		if searchBy == "init_date" {
			parsedInitDate, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, apierrors.ValidationError("Parametro 'search_value' inválido para init_date, use RFC3339", nil)
			}
			searchValue = parsedInitDate.Format(time.RFC3339)
		}

		if searchBy == "end_date" {
			parsedEndDate, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, apierrors.ValidationError("Parametro 'search_value' inválido para end_date, use RFC3339", nil)
			}
			searchValue = parsedEndDate.Format(time.RFC3339)
		}

		if searchBy == "has_attendance" {
			if _, err := strconv.ParseBool(searchValue); err != nil {
				return nil, apierrors.ValidationError("Parametro 'search_value' inválido para has_attendance", nil)
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
