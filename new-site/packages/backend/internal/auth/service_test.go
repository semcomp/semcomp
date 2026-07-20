package auth

import (
	"testing"

	"backend/internal/apierrors"
	"backend/internal/providers"
	"backend/internal/user"
)

// MockUserRepository implementa a interface user.UserRepository manualmente
type MockUserRepository struct {
	GetByEmailFunc func(email string) (*user.User, error)
}

func (m *MockUserRepository) Create(u *user.User) error           { return nil }
func (m *MockUserRepository) GetByID(id uint) (*user.User, error) { return nil, nil }
func (m *MockUserRepository) GetByEmail(email string) (*user.User, error) {
	return m.GetByEmailFunc(email)
}
func (m *MockUserRepository) GetByVerificationTokenHash(hash string) (*user.User, error) {
	return nil, nil
}
func (m *MockUserRepository) GetAll(query user.UserListQuery) (*user.UserListResult, error) {
	return nil, nil
}
func (m *MockUserRepository) Update(u *user.User) error { return nil }
func (m *MockUserRepository) Delete(id uint) error      { return nil }

// MockPasswordProvider implementa providers.PasswordProvider manualmente
type MockPasswordProvider struct {
	CompareFunc func(hashedPassword string, password string) error
}

func (m *MockPasswordProvider) Hash(password string) (string, error) { return password, nil }
func (m *MockPasswordProvider) Compare(hashedPassword string, password string) error {
	return m.CompareFunc(hashedPassword, password)
}

// Testa se o login é rejeitado com 403 quando o e-mail do usuário não foi verificado.
// jwtProvider é passado como nil de propósito: o gate de verificação retorna antes de
// alcançar a geração do token, então o mock nunca é chamado.
func TestLogin_EmailNotVerified_Forbidden(t *testing.T) {
	repo := &MockUserRepository{
		GetByEmailFunc: func(email string) (*user.User, error) {
			return &user.User{Email: email, PasswordHash: "senha123", EmailVerified: false}, nil
		},
	}
	passwordProvider := &MockPasswordProvider{CompareFunc: func(hashed, plain string) error { return nil }}
	service := NewAuthService(repo, passwordProvider, nil)

	_, _, err := service.Login(LoginUserRequest{Email: "ana@example.com", Password: "senha123"})

	var apiErr *apierrors.APIError
	if e, ok := err.(*apierrors.APIError); ok {
		apiErr = e
	}
	if apiErr == nil || apiErr.Status != 403 {
		t.Fatalf("esperado erro 403 (forbidden), recebido: %v", err)
	}
}

// MockJWTProvider implementa providers.JWTProvider manualmente (só o necessário para os testes)
type MockJWTProvider struct{}

func (m *MockJWTProvider) Generate(userID uint, email string) (string, error) {
	return "fake-jwt-token", nil
}
func (m *MockJWTProvider) Parse(token string) (*providers.AuthTokenClaims, error) { return nil, nil }
func (m *MockJWTProvider) GenerateToBackoffice(email string) (string, error)      { return "", nil }
func (m *MockJWTProvider) ParseToBackoffice(token string) (*providers.AuthBackofficeTokenClaims, error) {
	return nil, nil
}

// Testa se o login é aceito e gera token quando o e-mail já foi verificado
func TestLogin_EmailVerified_Success(t *testing.T) {
	repo := &MockUserRepository{
		GetByEmailFunc: func(email string) (*user.User, error) {
			return &user.User{Email: email, PasswordHash: "senha123", EmailVerified: true}, nil
		},
	}
	passwordProvider := &MockPasswordProvider{CompareFunc: func(hashed, plain string) error { return nil }}
	service := NewAuthService(repo, passwordProvider, &MockJWTProvider{})

	safeUser, token, err := service.Login(LoginUserRequest{Email: "ana@example.com", Password: "senha123"})

	if err != nil {
		t.Fatalf("erro não esperado: %v", err)
	}
	if token != "fake-jwt-token" {
		t.Fatalf("token inesperado: %s", token)
	}
	if safeUser.Email != "ana@example.com" {
		t.Fatalf("safeUser inesperado: %v", safeUser)
	}
}
