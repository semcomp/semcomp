package user

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
)

// MockUserService implementa a interface UserService manualmente
type MockUserService struct {
	CreateUserFunc         func(request CreateUserRequest) (*SafeUser, error)
	GetAllUsersFunc        func(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserListResult, error)
	GetUserByIDFunc        func(id uint) (*SafeUser, error)
	UpdateUserFunc         func(id uint, request UpdateUserRequest) error
	DeleteUserFunc         func(id uint) error
	VerifyEmailFunc        func(rawToken string) error
	ResendVerificationFunc func(email string) error
}

func (m *MockUserService) CreateUser(request CreateUserRequest) (*SafeUser, error) {
	return m.CreateUserFunc(request)
}
func (m *MockUserService) GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserListResult, error) {
	return m.GetAllUsersFunc(page, limit, sortBy, sortOrder, searchBy, searchValue)
}
func (m *MockUserService) GetUserByID(id uint) (*SafeUser, error) { return m.GetUserByIDFunc(id) }
func (m *MockUserService) UpdateUser(id uint, request UpdateUserRequest) error {
	return m.UpdateUserFunc(id, request)
}
func (m *MockUserService) DeleteUser(id uint) error          { return m.DeleteUserFunc(id) }
func (m *MockUserService) VerifyEmail(rawToken string) error { return m.VerifyEmailFunc(rawToken) }
func (m *MockUserService) ResendVerification(email string) error {
	return m.ResendVerificationFunc(email)
}
func (m *MockUserService) GetAllPapfeDocuments() ([]PapfeDocumentInfo, error) {
	panic("not implemented in mock")
}
func (m *MockUserService) GetPapfeDocument(email string) (*PapfeDocument, error) {
	panic("not implemented in mock")
}
func (m *MockUserService) UpdatePapfeDocument(email string, filename string, contentType string, data []byte) error {
	panic("not implemented in mock")
}
func (m *MockUserService) ApprovePapfeDocument(email string, approved bool) error {
	panic("not implemented in mock")
}
func (m *MockUserService) UpdateProfile(email string, request UpdateProfileRequest) (*SafeUser, error) {
	panic("not implemented in mock")
}
func (m *MockUserService) RequestPasswordReset(email string) error {
	panic("not implemented in mock")
}
func (m *MockUserService) ResetPassword(tokenPlain string, newPassword string) error {
	panic("not implemented in mock")
}

func setupVerificationRouter(handler *UserHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/verify-email", handler.VerifyEmail)
	r.POST("/resend-verification", handler.ResendVerification)
	return r
}

// Testa se o handler responde 200 quando o token de verificação é válido
func TestHandlerVerifyEmail_Success(t *testing.T) {
	service := &MockUserService{VerifyEmailFunc: func(rawToken string) error {
		if rawToken != "abc123" {
			t.Errorf("token inesperado: %s", rawToken)
		}
		return nil
	}}
	router := setupVerificationRouter(NewUserHandler(service))

	body, _ := json.Marshal(VerifyEmailRequest{Token: "abc123"})
	req := httptest.NewRequest(http.MethodPost, "/verify-email", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, recebido %d: %s", w.Code, w.Body.String())
	}
}

// Testa se o handler responde 404 quando o token de verificação é inválido/expirado
func TestHandlerVerifyEmail_InvalidToken(t *testing.T) {
	service := &MockUserService{VerifyEmailFunc: func(rawToken string) error {
		return apierrors.NotFoundError("Link de verificação inválido ou expirado", nil)
	}}
	router := setupVerificationRouter(NewUserHandler(service))

	body, _ := json.Marshal(VerifyEmailRequest{Token: "abc123"})
	req := httptest.NewRequest(http.MethodPost, "/verify-email", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("esperado 404, recebido %d: %s", w.Code, w.Body.String())
	}
}

// Testa se o handler rejeita um corpo sem o campo "token"
func TestHandlerVerifyEmail_MissingToken(t *testing.T) {
	service := &MockUserService{VerifyEmailFunc: func(rawToken string) error {
		t.Fatalf("serviço não deveria ser chamado com payload inválido")
		return nil
	}}
	router := setupVerificationRouter(NewUserHandler(service))

	req := httptest.NewRequest(http.MethodPost, "/verify-email", bytes.NewReader([]byte(`{}`)))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400, recebido %d: %s", w.Code, w.Body.String())
	}
}

// Testa se o handler de reenvio sempre responde 200, mesmo para e-mails inexistentes
func TestHandlerResendVerification_AlwaysOK(t *testing.T) {
	service := &MockUserService{ResendVerificationFunc: func(email string) error { return nil }}
	router := setupVerificationRouter(NewUserHandler(service))

	body, _ := json.Marshal(ResendVerificationRequest{Email: "naoexiste@example.com"})
	req := httptest.NewRequest(http.MethodPost, "/resend-verification", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, recebido %d: %s", w.Code, w.Body.String())
	}
}
