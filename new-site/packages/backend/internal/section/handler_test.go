package section

import (
	"backend/internal/apierrors"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// MockSectionService implementa a interface SectionService manualmente
type MockSectionService struct {
	InitializeSectionsFunc  func() error
	CreateSectionFunc       func(request CreateSectionRequest) (*Section, error)
	GetSectionByNameFunc    func(name string) (*Section, error)
	DeleteSectionByNameFunc func(name string) error
	UpdateSectionByNameFunc func(name string, request UpdateSectionRequest) (*Section, error)
	GetSectionsFunc         func(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SectionListResult, error)
}

func (m *MockSectionService) InitializeSections() error {
	return m.InitializeSectionsFunc()
}

func (m *MockSectionService) CreateSection(request CreateSectionRequest) (*Section, error) {
	return m.CreateSectionFunc(request)
}

func (m *MockSectionService) GetSectionByName(name string) (*Section, error) {
	return m.GetSectionByNameFunc(name)
}

func (m *MockSectionService) DeleteSectionByName(name string) error {
	return m.DeleteSectionByNameFunc(name)
}

func (m *MockSectionService) UpdateSectionByName(name string, request UpdateSectionRequest) (*Section, error) {
	return m.UpdateSectionByNameFunc(name, request)
}

func (m *MockSectionService) GetSections(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SectionListResult, error) {
	return m.GetSectionsFunc(page, limit, sortBy, sortOrder, searchBy, searchValue)
}

// setupRouter cria um roteador Gin em modo de teste com todas as rotas do SectionHandler
func setupRouter(handler *SectionHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/admin/secao", handler.CreateSection)
	r.GET("/admin/secao", handler.GetSections)
	r.GET("/admin/secao/:sectionName", handler.GetSectionByName)
	r.DELETE("/admin/secao/:sectionName", handler.DeleteSectionByName)
	r.PUT("/admin/secao/:sectionName", handler.UpdateSectionByName)
	return r
}

// Testa se o handler responde 201 Created quando o serviço cria a seção com sucesso
func TestHandlerCreateSection_Success(t *testing.T) {
	mockService := &MockSectionService{
		CreateSectionFunc: func(request CreateSectionRequest) (*Section, error) {
			return &Section{Name: request.Name, Description: request.Description}, nil
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	body, _ := json.Marshal(map[string]string{"name": "Eventos", "description": "Desc"})
	req := httptest.NewRequest(http.MethodPost, "/admin/secao", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("esperado status %d, recebido %d", http.StatusCreated, w.Code)
	}
}

// Testa se o handler responde 400 Bad Request quando o corpo da requisição não contém os campos obrigatórios (ex.: "name" ausente)
func TestHandlerCreateSection_InvalidBody(t *testing.T) {
	handler := NewSectionHandler(&MockSectionService{})
	r := setupRouter(handler)

	// Corpo JSON inválido (campo obrigatório "name" ausente)
	body := []byte(`{}`)
	req := httptest.NewRequest(http.MethodPost, "/admin/secao", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperado status %d, recebido %d", http.StatusBadRequest, w.Code)
	}
}

// Testa se o handler responde 500 Internal Server Error quando o serviço retorna um erro inesperado ao criar a seção
func TestHandlerCreateSection_ServiceError(t *testing.T) {
	mockService := &MockSectionService{
		CreateSectionFunc: func(request CreateSectionRequest) (*Section, error) {
			return nil, apierrors.InternalServerError("Não foi possivel criar a secao", nil)
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	body, _ := json.Marshal(map[string]string{"name": "Eventos", "description": "Desc"})
	req := httptest.NewRequest(http.MethodPost, "/admin/secao", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("esperado status %d, recebido %d", http.StatusInternalServerError, w.Code)
	}
}

// Testa se o handler responde 200 OK com os dados da seção quando ela é encontrada pelo serviço
func TestHandlerGetSectionByName_Success(t *testing.T) {
	expected := &Section{Name: "Eventos", Description: "Desc"}
	mockService := &MockSectionService{
		GetSectionByNameFunc: func(name string) (*Section, error) {
			return expected, nil
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodGet, "/admin/secao/Eventos", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperado status %d, recebido %d", http.StatusOK, w.Code)
	}
}

// Testa se o handler responde 404 Not Found quando o serviço retorna ErrSectionNotFound
func TestHandlerGetSectionByName_NotFound(t *testing.T) {
	mockService := &MockSectionService{
		GetSectionByNameFunc: func(name string) (*Section, error) {
			return nil, apierrors.NotFoundError("Seção não encontrada", nil)
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodGet, "/admin/secao/Inexistente", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("esperado status %d, recebido %d", http.StatusNotFound, w.Code)
	}
}

// Testa se o handler responde 500 quando o serviço retorna um erro genérico
func TestHandlerGetSectionByName_ServiceError(t *testing.T) {
	mockService := &MockSectionService{
		GetSectionByNameFunc: func(name string) (*Section, error) {
			return nil, &genericError{"erro interno"}
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodGet, "/admin/secao/Eventos", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("esperado status %d, recebido %d", http.StatusInternalServerError, w.Code)
	}
}

// genericError é um tipo auxiliar que implementa a interface error para simular falhas internas do serviço
type genericError struct{ msg string }

func (e *genericError) Error() string { return e.msg }

// Testa se o handler responde 200 OK com mensagem de confirmação quando a seção é removida com sucesso
func TestHandlerDeleteSectionByName_Success(t *testing.T) {
	mockService := &MockSectionService{
		DeleteSectionByNameFunc: func(name string) error {
			return nil
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodDelete, "/admin/secao/Eventos", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperado status %d, recebido %d", http.StatusOK, w.Code)
	}
}

// Testa se o handler responde 404 quando o serviço indica que a seção a ser removida não existe
func TestHandlerDeleteSectionByName_NotFound(t *testing.T) {
	mockService := &MockSectionService{
		DeleteSectionByNameFunc: func(name string) error {
			return apierrors.NotFoundError("Seção não encontrada", nil)
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodDelete, "/admin/secao/Inexistente", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("esperado status %d, recebido %d", http.StatusNotFound, w.Code)
	}
}

// Testa se o handler responde 500 quando o serviço retorna um erro inesperado ao tentar remover a seção
func TestHandlerDeleteSectionByName_ServiceError(t *testing.T) {
	mockService := &MockSectionService{
		DeleteSectionByNameFunc: func(name string) error {
			return &genericError{"erro interno"}
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodDelete, "/admin/secao/Eventos", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("esperado status %d, recebido %d", http.StatusInternalServerError, w.Code)
	}
}

// Testa se o handler responde 200 OK com os dados atualizados quando o serviço executa a atualização com sucesso
func TestHandlerUpdateSectionByName_Success(t *testing.T) {
	mockService := &MockSectionService{
		UpdateSectionByNameFunc: func(name string, request UpdateSectionRequest) (*Section, error) {
			return &Section{Name: request.Name, Description: request.Description}, nil
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	body, _ := json.Marshal(map[string]string{"name": "Atualizado", "description": "Nova desc"})
	req := httptest.NewRequest(http.MethodPut, "/admin/secao/Eventos", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperado status %d, recebido %d", http.StatusOK, w.Code)
	}
}

// Testa se o handler responde 400 quando o corpo da requisição está incompleto (campo obrigatório "name" ausente)
func TestHandlerUpdateSectionByName_InvalidBody(t *testing.T) {
	handler := NewSectionHandler(&MockSectionService{})
	r := setupRouter(handler)

	body := []byte(`{}`) // "name" obrigatório ausente
	req := httptest.NewRequest(http.MethodPut, "/admin/secao/Eventos", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperado status %d, recebido %d", http.StatusBadRequest, w.Code)
	}
}

// Testa se o handler responde 404 quando o serviço indica que a seção a ser atualizada não existe
func TestHandlerUpdateSectionByName_NotFound(t *testing.T) {
	mockService := &MockSectionService{
		UpdateSectionByNameFunc: func(name string, request UpdateSectionRequest) (*Section, error) {
			return nil, apierrors.NotFoundError("Seção não encontrada", nil)
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	body, _ := json.Marshal(map[string]string{"name": "Atualizado", "description": "Nova desc"})
	req := httptest.NewRequest(http.MethodPut, "/admin/secao/Inexistente", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("esperado status %d, recebido %d", http.StatusNotFound, w.Code)
	}
}

// Testa se o handler responde 500 quando o serviço retorna um erro inesperado ao atualizar a seção
func TestHandlerUpdateSectionByName_ServiceError(t *testing.T) {
	mockService := &MockSectionService{
		UpdateSectionByNameFunc: func(name string, request UpdateSectionRequest) (*Section, error) {
			return nil, &genericError{"erro interno"}
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	body, _ := json.Marshal(map[string]string{"name": "Atualizado", "description": "Nova desc"})
	req := httptest.NewRequest(http.MethodPut, "/admin/secao/Eventos", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("esperado status %d, recebido %d", http.StatusInternalServerError, w.Code)
	}
}

// Testa se o handler responde 200 OK com a lista de seções e metadados de paginação quando o serviço retorna resultados
func TestHandlerGetSections_Success(t *testing.T) {
	mockService := &MockSectionService{
		GetSectionsFunc: func(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SectionListResult, error) {
			return &SectionListResult{
				Sections:        []Section{{Name: "Eventos", Description: "Desc"}},
				TotalRecords:    1,
				FilteredRecords: 1,
			}, nil
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodGet, "/admin/secao?page=1&limit=10&sort_by=name&sort_order=asc", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperado status %d, recebido %d", http.StatusOK, w.Code)
	}
}

// Testa se o handler responde 400 quando o parâmetro "page" não pode ser convertido para inteiro
func TestHandlerGetSections_InvalidPageParam(t *testing.T) {
	handler := NewSectionHandler(&MockSectionService{})
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodGet, "/admin/secao?page=abc", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperado status %d, recebido %d", http.StatusBadRequest, w.Code)
	}
}

// Testa se o handler responde 400 quando o parâmetro "limit" não pode ser convertido para inteiro
func TestHandlerGetSections_InvalidLimitParam(t *testing.T) {
	handler := NewSectionHandler(&MockSectionService{})
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodGet, "/admin/secao?limit=abc", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperado status %d, recebido %d", http.StatusBadRequest, w.Code)
	}
}

// Testa se o handler responde 400 quando o serviço rejeita parâmetros inválidos (ex.: sort_by fora da lista permitida)
func TestHandlerGetSections_ServiceValidationError(t *testing.T) {
	mockService := &MockSectionService{
		GetSectionsFunc: func(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SectionListResult, error) {
			return nil, &genericError{"invalid sort_by parameter"}
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	req := httptest.NewRequest(http.MethodGet, "/admin/secao?sort_by=invalido", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperado status %d, recebido %d", http.StatusBadRequest, w.Code)
	}
}

// Testa se o handler aplica corretamente os valores padrão (page=1, limit=10, sort_by="name", sort_order="asc") quando nenhum parâmetro de query é fornecido na requisição
func TestHandlerGetSections_DefaultParams(t *testing.T) {
	mockService := &MockSectionService{
		GetSectionsFunc: func(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SectionListResult, error) {
			// Verifica se os valores padrão foram aplicados corretamente
			if page != 1 {
				return nil, &genericError{"page deveria ser 1"}
			}
			if limit != 10 {
				return nil, &genericError{"limit deveria ser 10"}
			}
			if sortBy != "name" {
				return nil, &genericError{"sort_by deveria ser 'name'"}
			}
			if sortOrder != "asc" {
				return nil, &genericError{"sort_order deveria ser 'asc'"}
			}
			return &SectionListResult{}, nil
		},
	}
	handler := NewSectionHandler(mockService)
	r := setupRouter(handler)

	// sem parâmetros -> usa os valores padrão do handler
	req := httptest.NewRequest(http.MethodGet, "/admin/secao", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperado status %d, recebido %d — corpo: %s", http.StatusOK, w.Code, w.Body.String())
	}
}
