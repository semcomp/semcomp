package signinEvent

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"
	"backend/internal/event"

	"gorm.io/gorm"
)

type SigninEventService interface {
	CreateSignin(userNumber uint, request CreateSigninRequest) (*SigninEvent, error)
	GetSigninEvents() ([]event.Event, error)
	GetMySignins(userNumber uint) ([]SigninEventsDetailed, error)
	DeleteSignin(userNumber uint, eventName string, eventInitDate string) error
	GetSigninsAdmin(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SigninEventListResult, error)
	GetSigninAdmin(userNumber string, eventName string, eventInitDate string) (*SigninEvent, error)
	CreateSigninAdmin(request CreateSigninAdminRequest) (*SigninEvent, error)
	UpdateSigninAdmin(userNumber string, eventName string, eventInitDate string, request UpdateSigninAdminRequest) (*SigninEvent, error)
	DeleteSigninAdmin(userNumber string, eventName string, eventInitDate string) error
}

type signinEventService struct {
	repo      SigninEventRepository
	eventRepo event.EventRepository
}

func NewSigninEventService(repo SigninEventRepository, eventRepo event.EventRepository) SigninEventService {
	return &signinEventService{repo: repo, eventRepo: eventRepo}
}

func (s *signinEventService) CreateSignin(userNumber uint, request CreateSigninRequest) (*SigninEvent, error) {
	eventRecord, err := s.eventRepo.GetByNameAndInitTime(request.EventName, request.EventInitDate)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Evento não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar evento", err)
	}

	if !eventRecord.HasSignin {
		return nil, apierrors.ValidationError("Este evento não permite inscrição", nil)
	}

	// Impede inscrição duplicada, inclusive para usuários já cancelados mais de uma vez.
	if _, err := s.repo.GetByUserEventAndInitDate(userNumber, request.EventName, request.EventInitDate); err == nil {
		return nil, apierrors.ConflictError("Usuário já inscrito neste evento", err)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar inscrição existente", err)
	}

	// Impede inscrição em eventos concomitantes
	conflicting, err := s.repo.FindActiveByUserAndInitDate(userNumber, request.EventInitDate)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar inscrições conflitantes", err)
	}
	if conflicting != nil && conflicting.EventName != request.EventName {
		return nil, apierrors.ConflictError("Usuário já inscrito em outro evento no mesmo horário", err)
	}

	status := StatusRegistered
	var waitListPosition uint

	if eventRecord.MaxParticipants > 0 {
		registered, err := s.repo.CountByStatus(request.EventName, request.EventInitDate, StatusRegistered)
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao verificar vagas do evento", err)
		}

		if registered >= int64(eventRecord.MaxParticipants) {
			status = StatusWaitListed

			active, err := s.repo.CountActiveByEvent(request.EventName, request.EventInitDate)
			if err != nil {
				return nil, apierrors.InternalServerError("Erro ao calcular posição na lista de espera", err)
			}
			waitListPosition = uint(active + 1)
		}
	}

	newSignin := SigninEvent{
		UserNumber:           userNumber,
		EventName:            request.EventName,
		EventInitDate:        request.EventInitDate,
		UserWaitListPosition: waitListPosition,
		Status:               status,
	}

	if err := s.repo.Create(&newSignin); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar inscrição", err)
	}

	return &newSignin, nil
}

func (s *signinEventService) GetSigninEvents() ([]event.Event, error) {
	events, err := s.eventRepo.ListSigninableEvents()
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar eventos para inscrição", err)
	}

	return events, nil
}

func (s *signinEventService) GetMySignins(userNumber uint) ([]SigninEventsDetailed, error) {
	signins, err := s.repo.FindActiveByUser(userNumber)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar inscrições do usuário", err)
	}

	return signins, nil
}

func (s *signinEventService) DeleteSignin(userNumber uint, eventName string, eventInitDate string) error {
	initTime, err := time.Parse(time.RFC3339, eventInitDate)
	if err != nil {
		return apierrors.ValidationError("Data do evento inválida. Use o formato RFC3339", err)
	}

	signin, err := s.repo.GetByUserEventAndInitDate(userNumber, eventName, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Inscrição não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao buscar inscrição", err)
	}

	if signin.Status == StatusCancelled {
		return apierrors.ConflictError("Inscrição já cancelada", nil)
	}

	confirmed := signin.Status == StatusRegistered

	err = s.repo.UpdateStatus(userNumber, eventName, initTime, StatusCancelled)
	if err != nil {
		return apierrors.InternalServerError("Erro ao cancelar inscrição", err)
	}

	// Se o cancelado tinha inscrição confirmada, promove o primeiro da fila de espera.
	if confirmed {
		next, err := s.repo.GetFirstWaitListed(eventName, initTime)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return apierrors.InternalServerError("Erro ao buscar próximo da fila de espera", err)
			}
		} else if err := s.repo.PromoteToRegistered(next.UserNumber, eventName, initTime); err != nil {
			return apierrors.InternalServerError("Erro ao promover usuário da fila de espera", err)
		}
	}

	return nil
}

func (s *signinEventService) GetSigninsAdmin(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SigninEventListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}
	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
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
		"user_number":             true,
		"event_name":              true,
		"event_init_date":         true,
		"status":                  true,
		"user_wait_list_position": true,
	}
	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parâmetro 'sort_by' inválido", nil)
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("Parâmetro 'sort_order' inválido", nil)
	}
	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("Parâmetro 'search_by' e 'search_value' devem ser fornecidos juntos", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)
		allowedSearchFields := map[string]bool{
			"user_number":     true,
			"event_name":      true,
			"event_init_date": true,
			"status":          true,
		}
		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parâmetro 'search_by' inválido", nil)
		}
		if searchBy == "event_init_date" {
			parsed, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, apierrors.ValidationError("Parâmetro 'search_value' inválido para 'event_init_date', use o formato RFC3339", nil)
			}
			searchValue = parsed.Format(time.RFC3339)
		}
	}

	offset := (page - 1) * limit
	query := SigninEventListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetAll(query)
}

func (s *signinEventService) GetSigninAdmin(userNumber string, eventName string, eventInitDate string) (*SigninEvent, error) {
	initTime, err := time.Parse(time.RFC3339, eventInitDate)
	if err != nil {
		return nil, apierrors.ValidationError("Data do evento inválida. Use o formato RFC3339", err)
	}

	num, err := strconv.ParseUint(userNumber, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("Número do usuário inválido", err)
	}

	signin, err := s.repo.GetByUserEventAndInitDate(uint(num), eventName, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Inscrição não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar inscrição", err)
	}

	return signin, nil
}

func (s *signinEventService) CreateSigninAdmin(request CreateSigninAdminRequest) (*SigninEvent, error) {
	if _, err := s.repo.GetByUserEventAndInitDate(request.UserNumber, request.EventName, request.EventInitDate); err == nil {
		return nil, apierrors.ConflictError("Inscrição já existente", err)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar inscrição existente", err)
	}

	newSignin := SigninEvent{
		UserNumber:    request.UserNumber,
		EventName:     request.EventName,
		EventInitDate: request.EventInitDate,
		Status:        request.Status,
	}

	if err := s.repo.Create(&newSignin); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar inscrição", err)
	}

	return &newSignin, nil
}

func (s *signinEventService) UpdateSigninAdmin(userNumber string, eventName string, eventInitDate string, request UpdateSigninAdminRequest) (*SigninEvent, error) {
	initTime, err := time.Parse(time.RFC3339, eventInitDate)
	if err != nil {
		return nil, apierrors.ValidationError("Data do evento inválida. Use o formato RFC3339", err)
	}

	num, err := strconv.ParseUint(userNumber, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("Número do usuário inválido", err)
	}

	signin, err := s.repo.GetByUserEventAndInitDate(uint(num), eventName, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Inscrição não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar inscrição", err)
	}

	updates := SigninEvent{
		UserNumber:    signin.UserNumber,
		EventName:     signin.EventName,
		EventInitDate: signin.EventInitDate,
		Status:        request.Status,
	}

	if request.Status == StatusRegistered {
		updates.UserWaitListPosition = 0
	} else {
		updates.UserWaitListPosition = signin.UserWaitListPosition
	}

	if err := s.repo.UpdateByComposite(signin.UserNumber, signin.EventName, signin.EventInitDate, &updates); err != nil {
		return nil, apierrors.InternalServerError("Erro ao atualizar inscrição", err)
	}

	return &updates, nil
}

func (s *signinEventService) DeleteSigninAdmin(userNumber string, eventName string, eventInitDate string) error {
	initTime, err := time.Parse(time.RFC3339, eventInitDate)
	if err != nil {
		return apierrors.ValidationError("Data do evento inválida. Use o formato RFC3339", err)
	}

	num, err := strconv.ParseUint(userNumber, 10, 64)
	if err != nil {
		return apierrors.ValidationError("Número do usuário inválido", err)
	}

	signin, err := s.repo.GetByUserEventAndInitDate(uint(num), eventName, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Inscrição não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao buscar inscrição", err)
	}

	if err := s.repo.DeleteByComposite(signin.UserNumber, signin.EventName, signin.EventInitDate); err != nil {
		return apierrors.InternalServerError("Erro ao deletar inscrição", err)
	}

	return nil
}
