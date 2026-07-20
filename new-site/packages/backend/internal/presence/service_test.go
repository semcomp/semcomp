package presence

import (
	"errors"
	"testing"
	"time"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type mockPresenceRepository struct {
	CreateFunc                       func(presence *Presence) error
	GetByUserEventandInitDateFunc    func(userNumber int64, eventName string, initDate time.Time) (*Presence, error)
	DeleteByUserEventandInitDateFunc func(userNumber int64, eventName string, initDate time.Time) error
	UpdateByUserEventandInitDateFunc func(userNumber int64, eventName string, initDate time.Time, updated *Presence) error
	GetPresencesFunc                 func(query PresenceListQuery) (*PresenceListResult, error)
}

func (m *mockPresenceRepository) Create(p *Presence) error {
	return m.CreateFunc(p)
}
func (m *mockPresenceRepository) GetByUserEventandInitDate(n int64, e string, d time.Time) (*Presence, error) {
	return m.GetByUserEventandInitDateFunc(n, e, d)
}
func (m *mockPresenceRepository) DeleteByUserEventandInitDate(n int64, e string, d time.Time) error {
	return m.DeleteByUserEventandInitDateFunc(n, e, d)
}
func (m *mockPresenceRepository) UpdateByUserEventandInitDate(n int64, e string, d time.Time, u *Presence) error {
	return m.UpdateByUserEventandInitDateFunc(n, e, d, u)
}
func (m *mockPresenceRepository) GetPresences(q PresenceListQuery) (*PresenceListResult, error) {
	return m.GetPresencesFunc(q)
}

func assertAPIError(t *testing.T, err error, expectedCode string) {
	t.Helper()
	var apiErr *apierrors.APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("esperava *apierrors.APIError, got %T: %v", err, err)
	}
	if apiErr.Code != expectedCode {
		t.Errorf("esperava code=%q, got %q", expectedCode, apiErr.Code)
	}
}

// --- CreatePresence ---

func TestCreatePresence_Success(t *testing.T) {
	repo := &mockPresenceRepository{
		CreateFunc: func(p *Presence) error { return nil },
	}
	svc := NewPresenceService(repo)

	presence, err := svc.CreatePresence(CreatePresenceRequest{
		UserNumber:    1,
		EventName:     "Evento",
		EventInitDate: time.Now(),
		EmailAdmin:    "admin@test.com",
	})

	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}
	if presence.UserNumber != 1 {
		t.Errorf("esperava UserNumber=1, got %d", presence.UserNumber)
	}
}

func TestCreatePresence_RepoError(t *testing.T) {
	repo := &mockPresenceRepository{
		CreateFunc: func(p *Presence) error { return errors.New("db error") },
	}
	svc := NewPresenceService(repo)

	_, err := svc.CreatePresence(CreatePresenceRequest{
		UserNumber: 1, EventName: "Evento",
		EventInitDate: time.Now(), EmailAdmin: "a@b.com",
	})

	assertAPIError(t, err, "internal_server_error")
}

// --- GetPresence ---

func TestGetPresence_InvalidDate(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})

	_, err := svc.GetPresenceByUserEventandInitDate("123", "Evento", "data-invalida")

	assertAPIError(t, err, "validation_error")
}

func TestGetPresence_InvalidUserNumber(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})

	_, err := svc.GetPresenceByUserEventandInitDate("nao-numero", "Evento", time.Now().Format(time.RFC3339))

	assertAPIError(t, err, "validation_error")
}

func TestGetPresence_NotFound(t *testing.T) {
	repo := &mockPresenceRepository{
		GetByUserEventandInitDateFunc: func(_ int64, _ string, _ time.Time) (*Presence, error) {
			return nil, gorm.ErrRecordNotFound
		},
	}
	svc := NewPresenceService(repo)

	_, err := svc.GetPresenceByUserEventandInitDate("123", "Evento", time.Now().Format(time.RFC3339))

	assertAPIError(t, err, "not_found")
}

func TestGetPresence_RepoError(t *testing.T) {
	repo := &mockPresenceRepository{
		GetByUserEventandInitDateFunc: func(_ int64, _ string, _ time.Time) (*Presence, error) {
			return nil, errors.New("db error")
		},
	}
	svc := NewPresenceService(repo)

	_, err := svc.GetPresenceByUserEventandInitDate("123", "Evento", time.Now().Format(time.RFC3339))

	assertAPIError(t, err, "internal_server_error")
}

// --- DeletePresence ---

func TestDeletePresence_InvalidDate(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})

	err := svc.DeletePresenceByUserEventandInitDate("123", "Evento", "invalida")

	assertAPIError(t, err, "validation_error")
}

func TestDeletePresence_NotFound(t *testing.T) {
	repo := &mockPresenceRepository{
		DeleteByUserEventandInitDateFunc: func(_ int64, _ string, _ time.Time) error {
			return gorm.ErrRecordNotFound
		},
	}
	svc := NewPresenceService(repo)

	err := svc.DeletePresenceByUserEventandInitDate("123", "Evento", time.Now().Format(time.RFC3339))

	assertAPIError(t, err, "not_found")
}

func TestDeletePresence_Success(t *testing.T) {
	repo := &mockPresenceRepository{
		DeleteByUserEventandInitDateFunc: func(_ int64, _ string, _ time.Time) error { return nil },
	}
	svc := NewPresenceService(repo)

	err := svc.DeletePresenceByUserEventandInitDate("123", "Evento", time.Now().Format(time.RFC3339))

	if err != nil {
		t.Errorf("esperava nil, got %v", err)
	}
}

// --- UpdatePresence ---

func TestUpdatePresence_NotFound(t *testing.T) {
	repo := &mockPresenceRepository{
		UpdateByUserEventandInitDateFunc: func(_ int64, _ string, _ time.Time, _ *Presence) error {
			return gorm.ErrRecordNotFound
		},
	}
	svc := NewPresenceService(repo)

	err := svc.UpdatePresenceByUserEventandInitDate("123", "Evento", time.Now().Format(time.RFC3339), UpdatePresenceRequest{
		UserNumber: 1, EventName: "Novo", EventInitDate: time.Now(), EmailAdmin: "a@b.com",
	})

	assertAPIError(t, err, "not_found")
}

// --- GetPresences ---

func TestGetPresences_InvalidPage(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})
	_, err := svc.GetPresences(0, 10, "", "", "", "")
	assertAPIError(t, err, "validation_error")
}

func TestGetPresences_InvalidLimit(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})
	_, err := svc.GetPresences(1, 0, "", "", "", "")
	assertAPIError(t, err, "validation_error")
}

func TestGetPresences_InvalidSortBy(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})
	_, err := svc.GetPresences(1, 10, "campo_invalido", "asc", "", "")
	assertAPIError(t, err, "validation_error")
}

func TestGetPresences_InvalidSortOrder(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})
	_, err := svc.GetPresences(1, 10, "event_name", "invalido", "", "")
	assertAPIError(t, err, "validation_error")
}

func TestGetPresences_SearchWithoutValue(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})
	_, err := svc.GetPresences(1, 10, "event_name", "asc", "event_name", "")
	assertAPIError(t, err, "validation_error")
}

func TestGetPresences_InvalidSearchBy(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})
	_, err := svc.GetPresences(1, 10, "event_name", "asc", "campo_invalido", "valor")
	assertAPIError(t, err, "validation_error")
}

func TestGetPresences_InvalidSearchDateFormat(t *testing.T) {
	svc := NewPresenceService(&mockPresenceRepository{})
	_, err := svc.GetPresences(1, 10, "event_name", "asc", "event_init_date", "nao-e-data")
	assertAPIError(t, err, "validation_error")
}

func TestGetPresences_Success(t *testing.T) {
	expected := &PresenceListResult{TotalRecords: 1, FilteredRecords: 1, Presences: []Presence{}}
	repo := &mockPresenceRepository{
		GetPresencesFunc: func(_ PresenceListQuery) (*PresenceListResult, error) {
			return expected, nil
		},
	}
	svc := NewPresenceService(repo)

	result, err := svc.GetPresences(1, 10, "event_name", "asc", "", "")

	if err != nil {
		t.Fatalf("esperava nil, got %v", err)
	}
	if result.TotalRecords != 1 {
		t.Errorf("esperava TotalRecords=1, got %d", result.TotalRecords)
	}
}
