package signinEvent

import (
	"errors"

	"backend/internal/apierrors"
	"backend/internal/event"

	"gorm.io/gorm"
)

type SigninEventService interface {
	CreateSignin(userNumber uint, request CreateSigninRequest) (*SigninEvent, error)
	GetSigninEvents() ([]event.Event, error)
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
