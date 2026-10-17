package signinEvent

import (
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"
	"backend/internal/event"

	"gorm.io/gorm"
)

type SigninEventService interface {
	SetPresenceCleaner(cleaner presenceCleaner)
	CreateSignin(userNumber uint, request CreateSigninRequest) (*SigninEvent, error)
	GetSigninEvents() ([]event.Event, error)
	GetMySignins(userNumber uint) ([]SigninEventsDetailed, error)
	DeleteSignin(userNumber uint, eventName string, eventInitDate string) error
	GetSigninsAdmin(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SigninEventListResult, error)
	GetSigninAdmin(userNumber string, eventName string, eventInitDate string) (*SigninEvent, error)
	CreateSigninAdmin(request CreateSigninAdminRequest) (*SigninEvent, error)
	UpdateSigninAdmin(userNumber string, eventName string, eventInitDate string, request UpdateSigninAdminRequest) (*SigninEvent, error)
	DeleteSigninAdmin(userNumber string, eventName string, eventInitDate string) error
	RegisterSigninAdmin(userNumber string, eventName string, eventInitDate string) (*SigninEvent, error)
	RotateSigninsAdmin(eventName string, eventInitDate string) ([]SigninEvent, error)
}

// presenceCleaner remove a presença do usuário no evento quando a inscrição é
// cancelada. Declarado como interface mínima (e injetado por setter) para não
// importar internal/presence — que já importa este pacote.
type presenceCleaner interface {
	ClearByUserEventAtomic(userNumber int64, eventName string, initDate time.Time) error
}

type signinEventService struct {
	repo            SigninEventRepository
	eventRepo       event.EventRepository
	presenceCleaner presenceCleaner
}

// SetPresenceCleaner injeta a limpeza de presença disparada ao cancelar
// inscrição. Chamado no main com o repositório de presença.
func (s *signinEventService) SetPresenceCleaner(cleaner presenceCleaner) {
	s.presenceCleaner = cleaner
}

func NewSigninEventService(repo SigninEventRepository, eventRepo event.EventRepository) SigninEventService {
	return &signinEventService{repo: repo, eventRepo: eventRepo}
}

func relativeWaitListPosition(status RegistrationStatus, max uint, position uint) uint {
	if status == StatusWaitListed && max > 0 && position > max {
		return position - max
	}
	return position
}

func (s *signinEventService) relativePosition(signin *SigninEvent, max uint) *SigninEvent {
	signin.UserWaitListPosition = relativeWaitListPosition(signin.Status, max, signin.UserWaitListPosition)
	return signin
}

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

	// Duplicate check, overlap check, count, and insert are all performed
	// atomically inside CreateAtomicSignin under advisory locks. UserWaitListPosition
	// is assigned server-side (count+1) — it is not part of the request DTO and
	// cannot be influenced by the caller.
	newSignin, err := s.repo.CreateAtomicSignin(
		userNumber,
		request.EventName,
		request.EventInitDate,
		eventRecord.MaxParticipants,
		eventRecord.EndDate,
	)
	if err != nil {
		switch {
		case errors.Is(err, ErrDuplicateInscription):
			return nil, apierrors.ConflictError("Usuário já inscrito neste evento", err)
		case errors.Is(err, ErrOverlappingInscription):
			return nil, apierrors.ConflictError("Usuário já inscrito em outro evento no mesmo horário", err)
		default:
			return nil, apierrors.InternalServerError("Erro ao criar inscrição", err)
		}
	}

	return s.relativePosition(newSignin, eventRecord.MaxParticipants), nil
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

	maxParticipants := uint(0)
	eventRecord, err := s.eventRepo.GetByNameAndInitTime(eventName, initTime)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return apierrors.InternalServerError("Erro ao buscar evento", err)
	} else if err == nil {
		maxParticipants = eventRecord.MaxParticipants
	}

	if err := s.repo.RemoveAtomicSignin(userNumber, eventName, initTime, maxParticipants); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Inscrição não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao cancelar inscrição", err)
	}

	// Cancela a inscrição, então a presença lançada para este evento deixa de
	// ter respaldo — removê-la evita presença órfã creditando o peso do evento.
	return s.clearPresenceForSignin(userNumber, eventName, initTime)
}

// clearPresenceForSignin remove a presença do usuário no evento, se existir,
// recalculando a taxa na mesma transação. Best-effort: se a limpeza falhar, a
// inscrição já foi cancelada e não deve ser revertida; apenas loga.
func (s *signinEventService) clearPresenceForSignin(userNumber uint, eventName string, initTime time.Time) error {
	if s.presenceCleaner == nil {
		return nil
	}
	if err := s.presenceCleaner.ClearByUserEventAtomic(int64(userNumber), eventName, initTime); err != nil {
		log.Printf("[signinEvent] erro ao limpar presença do usuário %d no evento %q: %v",
			userNumber, eventName, err)
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
	newSignin, err := s.repo.CreateAdminSignin(request.UserNumber, request.EventName, request.EventInitDate, request.Status)
	if err != nil {
		if errors.Is(err, ErrDuplicateInscription) {
			return nil, apierrors.ConflictError("Inscrição já existente", err)
		}
		return nil, apierrors.InternalServerError("Erro ao criar inscrição", err)
	}

	max, err := s.eventMaxParticipants(newSignin.EventName, newSignin.EventInitDate)
	if err != nil {
		return nil, err
	}

	return s.relativePosition(newSignin, max), nil
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

	maxParticipants, err := s.eventMaxParticipants(eventName, initTime)
	if err != nil {
		return nil, err
	}

	signin, err := s.repo.UpdateAdminSigninStatus(uint(num), eventName, initTime, request.Status, maxParticipants)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Inscrição não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar inscrição", err)
	}

	return s.relativePosition(signin, maxParticipants), nil
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

	maxParticipants := uint(0)
	eventRecord, err := s.eventRepo.GetByNameAndInitTime(eventName, initTime)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return apierrors.InternalServerError("Erro ao buscar evento", err)
	} else if err == nil {
		maxParticipants = eventRecord.MaxParticipants
	}

	if err := s.repo.RemoveAtomicSignin(uint(num), eventName, initTime, maxParticipants); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Inscrição não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao remover inscrição", err)
	}

	// Mesma razão do DeleteSignin: sem inscrição, a presença fica órfã.
	return s.clearPresenceForSignin(uint(num), eventName, initTime)
}

func (s *signinEventService) RegisterSigninAdmin(userNumber string, eventName string, eventInitDate string) (*SigninEvent, error) {
	initTime, err := time.Parse(time.RFC3339, eventInitDate)
	if err != nil {
		return nil, apierrors.ValidationError("Data do evento inválida. Use o formato RFC3339", err)
	}

	num, err := strconv.ParseUint(userNumber, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("Número do usuário inválido", err)
	}

	signin, err := s.repo.RegisterAtomicSignin(uint(num), eventName, initTime)
	if err != nil {
		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			return nil, apierrors.NotFoundError("Inscrição não encontrada", err)
		case errors.Is(err, ErrAlreadyRegistered):
			return nil, apierrors.ConflictError("Inscrição já registrada", nil)
		default:
			return nil, apierrors.InternalServerError("Erro ao registrar inscrição", err)
		}
	}

	max, err := s.eventMaxParticipants(signin.EventName, signin.EventInitDate)
	if err != nil {
		return nil, err
	}

	return s.relativePosition(signin, max), nil
}

func (s *signinEventService) RotateSigninsAdmin(eventName string, eventInitDate string) ([]SigninEvent, error) {
	initTime, err := time.Parse(time.RFC3339, eventInitDate)
	if err != nil {
		return nil, apierrors.ValidationError("Data do evento inválida. Use o formato RFC3339", err)
	}

	eventRecord, err := s.eventRepo.GetByNameAndInitTime(eventName, initTime)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Evento não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar evento", err)
	}

	if eventRecord.MaxParticipants == 0 {
		return nil, apierrors.ValidationError("Não é possível rodar a fila em eventos com vagas ilimitadas", nil)
	}

	signins, err := s.repo.RotateAtomicSignins(eventName, initTime, eventRecord.MaxParticipants)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao rodar a fila de inscrições", err)
	}

	for i := range signins {
		s.relativePosition(&signins[i], eventRecord.MaxParticipants)
	}

	return signins, nil
}
