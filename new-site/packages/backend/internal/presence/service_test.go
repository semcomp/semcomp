package presence

import (
	"errors"
	"testing"
	"time"

	"backend/internal/apierrors"
	"backend/internal/event"
	"backend/internal/signinEvent"

	"gorm.io/gorm"
)

// Stubs ---------------------------------------------------------------------------

type stubPresenceRepo struct {
	createErr error
	getResult *Presence
	getErr    error
}

func (s *stubPresenceRepo) Create(p *Presence) error { return s.createErr }
func (s *stubPresenceRepo) GetByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time) (*Presence, error) {
	return s.getResult, s.getErr
}
func (s *stubPresenceRepo) DeleteByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time) error {
	return nil
}
func (s *stubPresenceRepo) UpdateByUserEventandInitDate(userNumber int64, eventName string, initDate time.Time, updatedPresence *Presence) error {
	return nil
}
func (s *stubPresenceRepo) GetPresences(query PresenceListQuery) (*PresenceListResult, error) {
	return &PresenceListResult{}, nil
}

type stubEventRepo struct {
	getResult *event.Event
	getErr    error
}

func (s *stubEventRepo) Create(e *event.Event) error { return nil }
func (s *stubEventRepo) GetByNameAndInitTime(name string, initTime time.Time) (*event.Event, error) {
	return s.getResult, s.getErr
}
func (s *stubEventRepo) DeleteByNameAndInitTime(name string, initTime time.Time) error { return nil }
func (s *stubEventRepo) UpdateByNameAndInitTime(name string, initTime time.Time, e *event.Event) error {
	return nil
}
func (s *stubEventRepo) GetEvents(query event.EventListQuery) (*event.EventListResult, error) {
	return &event.EventListResult{}, nil
}
func (s *stubEventRepo) ListSigninableEvents() ([]event.Event, error) { return nil, nil }

type stubSigninRepo struct {
	getResult *signinEvent.SigninEvent
	getErr    error
}

func (s *stubSigninRepo) CreateAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint, targetEndDate time.Time) (*signinEvent.SigninEvent, error) {
	return nil, nil
}
func (s *stubSigninRepo) CreateAdminSignin(userNumber uint, eventName string, initDate time.Time, status signinEvent.RegistrationStatus) (*signinEvent.SigninEvent, error) {
	return nil, nil
}
func (s *stubSigninRepo) RemoveAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint) error {
	return nil
}
func (s *stubSigninRepo) GetByUserEventAndInitDate(userNumber uint, eventName string, initDate time.Time) (*signinEvent.SigninEvent, error) {
	return s.getResult, s.getErr
}
func (s *stubSigninRepo) FindActiveByUser(userNumber uint) ([]signinEvent.SigninEventsDetailed, error) {
	return nil, nil
}
func (s *stubSigninRepo) UpdateByComposite(userNumber uint, eventName string, initDate time.Time, updated *signinEvent.SigninEvent) error {
	return nil
}
func (s *stubSigninRepo) GetAll(query signinEvent.SigninEventListQuery) (*signinEvent.SigninEventListResult, error) {
	return &signinEvent.SigninEventListResult{}, nil
}
func (s *stubSigninRepo) RegisterAtomicSignin(userNumber uint, eventName string, initDate time.Time) (*signinEvent.SigninEvent, error) {
	return nil, nil
}
func (s *stubSigninRepo) UpdateAdminSigninStatus(userNumber uint, eventName string, initDate time.Time, newStatus signinEvent.RegistrationStatus, maxParticipants uint) (*signinEvent.SigninEvent, error) {
	return nil, nil
}
func (s *stubSigninRepo) RotateAtomicSignins(eventName string, initDate time.Time, maxParticipants uint) ([]signinEvent.SigninEvent, error) {
	return nil, nil
}

// Helpers --------------------------------------------------------------------------

func newRequest() CreatePresenceRequest {
	return CreatePresenceRequest{
		UserNumber:    42,
		EventName:     "Palestra Go",
		EventInitDate: time.Date(2026, 11, 1, 10, 0, 0, 0, time.UTC),
		EmailAdmin:    "admin@semcomp.com",
	}
}

func buildService(
	presenceRepo PresenceRepository,
	eventRepo event.EventRepository,
	signinRepo signinEvent.SigninEventRepository,
) PresenceService {
	return NewPresenceService(presenceRepo, eventRepo, signinRepo)
}

func assertForbidden(t *testing.T, err error) {
	t.Helper()
	if err == nil {
		t.Fatal("esperava erro 403, got nil")
	}
	var apiErr *apierrors.APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("esperava *apierrors.APIError, got %T", err)
	}
	if apiErr.Status != 403 {
		t.Errorf("esperava status HTTP 403, got %d", apiErr.Status)
	}
}

// Testes ---------------------------------------------------------------------------

// Evento sem inscrição obrigatória, qualquer participante pode ter presença
func TestCreatePresence_HasSigninFalse(t *testing.T) {
	svc := buildService(
		&stubPresenceRepo{getErr: gorm.ErrRecordNotFound},
		&stubEventRepo{getResult: &event.Event{HasSignin: false}},
		&stubSigninRepo{},
	)

	p, err := svc.CreatePresence(newRequest())
	if err != nil {
		t.Fatalf("esperava sucesso, got erro: %v", err)
	}
	if p.UserNumber != 42 {
		t.Errorf("UserNumber esperado 42, got %d", p.UserNumber)
	}
}

// Inscrição confirmada (Inscrito), presença permitida
func TestCreatePresence_HasSigninTrue_Confirmed(t *testing.T) {
	svc := buildService(
		&stubPresenceRepo{getErr: gorm.ErrRecordNotFound},
		&stubEventRepo{getResult: &event.Event{HasSignin: true}},
		&stubSigninRepo{
			getResult: &signinEvent.SigninEvent{Status: signinEvent.StatusRegistered},
		},
	)

	p, err := svc.CreatePresence(newRequest())
	if err != nil {
		t.Fatalf("esperava sucesso, got erro: %v", err)
	}
	if p.UserNumber != 42 {
		t.Errorf("UserNumber esperado 42, got %d", p.UserNumber)
	}
}

// Inscrição pendente (Aguardando Aprovação), presença bloqueada
func TestCreatePresence_HasSigninTrue_WaitingDonation(t *testing.T) {
	svc := buildService(
		&stubPresenceRepo{getErr: gorm.ErrRecordNotFound},
		&stubEventRepo{getResult: &event.Event{HasSignin: true}},
		&stubSigninRepo{
			getResult: &signinEvent.SigninEvent{Status: signinEvent.StatusWaitingDonation},
		},
	)

	assertForbidden(t, func() error { _, err := svc.CreatePresence(newRequest()); return err }())
}

// Inscrição em lista de espera, presença bloqueada
func TestCreatePresence_HasSigninTrue_WaitListed(t *testing.T) {
	svc := buildService(
		&stubPresenceRepo{getErr: gorm.ErrRecordNotFound},
		&stubEventRepo{getResult: &event.Event{HasSignin: true}},
		&stubSigninRepo{
			getResult: &signinEvent.SigninEvent{Status: signinEvent.StatusWaitListed},
		},
	)

	assertForbidden(t, func() error { _, err := svc.CreatePresence(newRequest()); return err }())
}

// Inscrição cancelada, presença bloqueada
func TestCreatePresence_HasSigninTrue_Cancelled(t *testing.T) {
	svc := buildService(
		&stubPresenceRepo{getErr: gorm.ErrRecordNotFound},
		&stubEventRepo{getResult: &event.Event{HasSignin: true}},
		&stubSigninRepo{
			getResult: &signinEvent.SigninEvent{Status: signinEvent.StatusCancelled},
		},
	)

	assertForbidden(t, func() error { _, err := svc.CreatePresence(newRequest()); return err }())
}

// Sem inscrição nenhuma, presença bloqueada
func TestCreatePresence_HasSigninTrue_NotEnrolled(t *testing.T) {
	svc := buildService(
		&stubPresenceRepo{getErr: gorm.ErrRecordNotFound},
		&stubEventRepo{getResult: &event.Event{HasSignin: true}},
		&stubSigninRepo{getErr: gorm.ErrRecordNotFound},
	)

	assertForbidden(t, func() error { _, err := svc.CreatePresence(newRequest()); return err }())
}

// Evento não encontrado, retorna 404
func TestCreatePresence_EventNotFound(t *testing.T) {
	svc := buildService(
		&stubPresenceRepo{getErr: gorm.ErrRecordNotFound},
		&stubEventRepo{getErr: gorm.ErrRecordNotFound},
		&stubSigninRepo{},
	)

	_, err := svc.CreatePresence(newRequest())
	if err == nil {
		t.Fatal("esperava erro para evento não encontrado")
	}
	var apiErr *apierrors.APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("esperava *apierrors.APIError, got %T", err)
	}
	if apiErr.Status != 404 {
		t.Errorf("esperava status HTTP 404, got %d", apiErr.Status)
	}
}

// Presença já existente, retorna 409
func TestCreatePresence_DuplicatePresence(t *testing.T) {
	svc := buildService(
		&stubPresenceRepo{getResult: &Presence{UserNumber: 42}},
		&stubEventRepo{getResult: &event.Event{HasSignin: false}},
		&stubSigninRepo{},
	)

	_, err := svc.CreatePresence(newRequest())
	if err == nil {
		t.Fatal("esperava erro de presença duplicada")
	}
	var apiErr *apierrors.APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("esperava *apierrors.APIError, got %T", err)
	}
	if apiErr.Status != 409 {
		t.Errorf("esperava status HTTP 409, got %d", apiErr.Status)
	}
}
