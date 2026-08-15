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

// relativeWaitListPosition retorna a posição relativa na fila de espera
// (posição - max) quando o usuário está na lista de espera; caso contrário
// mantém a posição geral.
func relativeWaitListPosition(status RegistrationStatus, max uint, position uint) uint {
	if status == StatusWaitListed && max > 0 && position > max {
		return position - max
	}
	return position
}

// relativePosition aplica relativeWaitListPosition sobre uma inscrição,
// usando o número máximo de participantes do próprio evento.
func (s *signinEventService) relativePosition(signin *SigninEvent, max uint) *SigninEvent {
	signin.UserWaitListPosition = relativeWaitListPosition(signin.Status, max, signin.UserWaitListPosition)
	return signin
}

// eventMaxParticipants retorna o número máximo de participantes do evento.
// Se o evento não existir, retorna 0 (nenhuma lista de espera).
func (s *signinEventService) eventMaxParticipants(eventName string, initDate time.Time) (uint, error) {
	eventRecord, err := s.eventRepo.GetByNameAndInitTime(eventName, initDate)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, apierrors.InternalServerError("Erro ao buscar evento", err)
		}
		return 0, nil
	}

	return eventRecord.MaxParticipants, nil
}

// removeSignin deleta a inscrição e reorganiza a fila: decrementa as posições
// posteriores e promove inscritos da lista de espera que passaram a ficar dentro do limite.
func (s *signinEventService) removeSignin(signin *SigninEvent) error {
	if err := s.repo.DeleteByComposite(signin.UserNumber, signin.EventName, signin.EventInitDate); err != nil {
		return apierrors.InternalServerError("Erro ao cancelar inscrição", err)
	}

	if signin.UserWaitListPosition > 0 {
		if err := s.repo.DecrementPositionsAfter(signin.EventName, signin.EventInitDate, signin.UserWaitListPosition); err != nil {
			return apierrors.InternalServerError("Erro ao reorganizar a fila", err)
		}
	}

	eventRecord, err := s.eventRepo.GetByNameAndInitTime(signin.EventName, signin.EventInitDate)
	if err != nil {
		return apierrors.InternalServerError("Erro ao buscar evento", err)
	}

	if err := s.repo.PromoteWithinLimit(signin.EventName, signin.EventInitDate, eventRecord.MaxParticipants); err != nil {
		return apierrors.InternalServerError("Erro ao promover usuário da lista de espera", err)
	}

	return nil
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

	// Impede inscrição duplicada (o cancelamento deleta o registro).
	if _, err := s.repo.GetByUserEventAndInitDate(userNumber, request.EventName, request.EventInitDate); err == nil {
		return nil, apierrors.ConflictError("Usuário já inscrito neste evento", err)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar inscrição existente", err)
	}

	// Impede inscrição em eventos concomitantes
	conflicting, err := s.repo.FindActiveOverlapping(userNumber, request.EventName, request.EventInitDate, eventRecord.EndDate)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar inscrições conflitantes", err)
	}
	if conflicting != nil {
		return nil, apierrors.ConflictError("Usuário já inscrito em outro evento no mesmo horário", err)
	}

	active, err := s.repo.CountActiveByEvent(request.EventName, request.EventInitDate)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao calcular posição na fila", err)
	}

	status := StatusWaitingDonation
	if eventRecord.MaxParticipants > 0 && active >= int64(eventRecord.MaxParticipants) {
		status = StatusWaitListed
	}

	newSignin := SigninEvent{
		UserNumber:           userNumber,
		EventName:            request.EventName,
		EventInitDate:        request.EventInitDate,
		UserWaitListPosition: uint(active + 1),
		Status:               status,
	}

	if err := s.repo.Create(&newSignin); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar inscrição", err)
	}

	return s.relativePosition(&newSignin, eventRecord.MaxParticipants), nil
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

	return s.removeSignin(signin)
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

	result, err := s.repo.GetAll(query)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao listar inscrições", err)
	}

	return result, nil
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

	max, err := s.eventMaxParticipants(signin.EventName, signin.EventInitDate)
	if err != nil {
		return nil, err
	}

	return s.relativePosition(signin, max), nil
}

func (s *signinEventService) CreateSigninAdmin(request CreateSigninAdminRequest) (*SigninEvent, error) {
	if _, err := s.repo.GetByUserEventAndInitDate(request.UserNumber, request.EventName, request.EventInitDate); err == nil {
		return nil, apierrors.ConflictError("Inscrição já existente", err)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar inscrição existente", err)
	}

	active, err := s.repo.CountActiveByEvent(request.EventName, request.EventInitDate)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao calcular posição na fila", err)
	}

	newSignin := SigninEvent{
		UserNumber:           request.UserNumber,
		EventName:            request.EventName,
		EventInitDate:        request.EventInitDate,
		UserWaitListPosition: uint(active + 1),
		Status:               request.Status,
	}

	if err := s.repo.Create(&newSignin); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar inscrição", err)
	}

	max, err := s.eventMaxParticipants(newSignin.EventName, newSignin.EventInitDate)
	if err != nil {
		return nil, err
	}

	return s.relativePosition(&newSignin, max), nil
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
		UserNumber:           signin.UserNumber,
		EventName:            signin.EventName,
		EventInitDate:        signin.EventInitDate,
		UserWaitListPosition: signin.UserWaitListPosition,
		Status:               request.Status,
	}

	if err := s.repo.UpdateByComposite(signin.UserNumber, signin.EventName, signin.EventInitDate, &updates); err != nil {
		return nil, apierrors.InternalServerError("Erro ao atualizar inscrição", err)
	}

	max, err := s.eventMaxParticipants(updates.EventName, updates.EventInitDate)
	if err != nil {
		return nil, err
	}

	return s.relativePosition(&updates, max), nil
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

	return s.removeSignin(signin)
}
