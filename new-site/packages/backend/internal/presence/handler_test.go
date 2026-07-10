package presence

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	//Adicionar "backend/internal/apierrors" depois
	"github.com/gin-gonic/gin"
)

// Mock do Service
type mockPresenceService struct {
	CreatePresenceFunc                       func(req CreatePresenceRequest) (*Presence, error)
	GetPresenceByUserEventandInitDateFunc    func(userNumber, eventName, initDate string) (*Presence, error)
	DeletePresenceByUserEventandInitDateFunc func(userNumber, eventName, initDate string) error
	UpdatePresenceByUserEventandInitDateFunc func(userNumber, eventName, initDate string, req UpdatePresenceRequest) error
	GetPresencesFunc                         func(page, limit int, sortBy, sortOrder, searchBy, searchValue string) (*PresenceListResult, error)
}

func (m *mockPresenceService) CreatePresence(req CreatePresenceRequest) (*Presence, error) {
	return m.CreatePresenceFunc(req)
}
func (m *mockPresenceService) GetPresenceByUserEventandInitDate(userNumber, eventName, initDate string) (*Presence, error) {
	return m.GetPresenceByUserEventandInitDateFunc(userNumber, eventName, initDate)
}
func (m *mockPresenceService) DeletePresenceByUserEventandInitDate(userNumber, eventName, initDate string) error {
	return m.DeletePresenceByUserEventandInitDateFunc(userNumber, eventName, initDate)
}
func (m *mockPresenceService) UpdatePresenceByUserEventandInitDate(userNumber, eventName, initDate string, req UpdatePresenceRequest) error {
	return m.UpdatePresenceByUserEventandInitDateFunc(userNumber, eventName, initDate, req)
}
func (m *mockPresenceService) GetPresences(page, limit int, sortBy, sortOrder, searchBy, searchValue string) (*PresenceListResult, error) {
	return m.GetPresencesFunc(page, limit, sortBy, sortOrder, searchBy, searchValue)
}

// setupRouter cria um roteador Gin em modo de teste com todas as rotas do PresenceHandler
func setupRouter(h *PresenceHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/admin/presences", h.CreatePresence)
	r.GET("/admin/presences", h.GetPresences)
	r.GET("/admin/presences/:userNumber/:eventName/:eventInitDate", h.GetPresenceByUserEventandInitDate)
	r.PUT("/admin/presences/:userNumber/:eventName/:eventInitDate", h.UpdatePresenceByUserEventandInitDate)
	r.DELETE("/admin/presences/:userNumber/:eventName/:eventInitDate", h.DeletePresenceByUserEventandInitDate)
	return r
}

func TestHandlerCreatePresence_Success(t *testing.T) {
	svc := &mockPresenceService{
		CreatePresenceFunc: func(req CreatePresenceRequest) (*Presence, error) {
			return &Presence{UserNumber: req.UserNumber, EventName: req.EventName, EventInitDate: req.EventInitDate, EmailAdmin: req.EmailAdmin}, nil
		},
	}
	router := setupRouter(NewPresenceHandler(svc))

	body, _ := json.Marshal(CreatePresenceRequest{
		UserNumber:    1,
		EventName:     "Evento",
		EventInitDate: time.Now(),
		EmailAdmin:    "a@b.com",
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/admin/presences", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("esperava 201, got %d", w.Code)
	}
}

func TestHandlerGetPresence_NotFound(t *testing.T) {
	svc := &mockPresenceService{
		GetPresenceByUserEventandInitDateFunc: func(_, _, _ string) (*Presence, error) {
			return nil, ErrPresenceNotFound //Depois substituir por apierrors.NotFoundError("Presenca não encontrada", nil)
		},
	}
	router := setupRouter(NewPresenceHandler(svc))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/admin/presences/123/Evento/2024-01-01T00:00:00Z", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("esperava 404, got %d", w.Code)
	}
}

func TestHandlerGetPresence_ValidationError(t *testing.T) {
	svc := &mockPresenceService{
		GetPresenceByUserEventandInitDateFunc: func(_, _, _ string) (*Presence, error) {
			return nil, ErrInvalidEventDate //Depois substituir por apierrors.ValidationError("Data do evento inválida", nil)
		},
	}
	router := setupRouter(NewPresenceHandler(svc))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/admin/presences/123/Evento/data-invalida", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest { // 400
		t.Errorf("esperava 400, got %d", w.Code)
	}
}

func TestHandlerDeletePresence_NotFound(t *testing.T) {
	svc := &mockPresenceService{
		DeletePresenceByUserEventandInitDateFunc: func(_, _, _ string) error {
			return ErrPresenceNotFound //Depois substituir por apierrors.NotFoundError("Presenca não encontrada", nil)
		},
	}
	router := setupRouter(NewPresenceHandler(svc))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/admin/presences/123/Evento/2024-01-01T00:00:00Z", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("esperava 404, got %d", w.Code)
	}
}

func TestHandlerDeletePresence_ValidationError(t *testing.T) {
	svc := &mockPresenceService{
		DeletePresenceByUserEventandInitDateFunc: func(_, _, _ string) error {
			return ErrInvalidEventDate //Depois substituir por apierrors.ValidationError("Data do evento inválida", nil)
		},
	}
	router := setupRouter(NewPresenceHandler(svc))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/admin/presences/123/Evento/data-invalida", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperava 400, got %d", w.Code)
	}
}

func TestHandlerUpdatePresence_NotFound(t *testing.T) {
	svc := &mockPresenceService{
		UpdatePresenceByUserEventandInitDateFunc: func(_, _, _ string, _ UpdatePresenceRequest) error {
			return ErrPresenceNotFound //Depois substituir por apierrors.NotFoundError("Presenca não encontrada", nil)
		},
	}
	router := setupRouter(NewPresenceHandler(svc))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/admin/presences/123/Evento/2024-01-01T00:00:00Z", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("esperava 404, got %d", w.Code)
	}
}

func TestHandlerUpdatePresence_ValidationError(t *testing.T) {
	svc := &mockPresenceService{
		UpdatePresenceByUserEventandInitDateFunc: func(_, _, _ string, _ UpdatePresenceRequest) error {
			return ErrInvalidEventDate //Depois substituir por apierrors.ValidationError("Data do evento inválida", nil)
		},
	}
	router := setupRouter(NewPresenceHandler(svc))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/admin/presences/123/Evento/data-invalida", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperava 400, got %d", w.Code)
	}
}

func TestHandlerGetPresences_ServiceError(t *testing.T) {
	svc := &mockPresenceService{
		GetPresencesFunc: func(_, _ int, _, _, _, _ string) (*PresenceListResult, error) {
			return nil, errors.New("invalid sort_by parameter") //Depois substituir por apierrors.ValidationError("Parâmetros inválidos", nil)
		},
	}
	router := setupRouter(NewPresenceHandler(svc))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/admin/presences?sort_by=invalido", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperava 400, got %d", w.Code)
	}
}
