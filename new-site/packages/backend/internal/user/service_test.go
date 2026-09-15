package user

import (
	"sync/atomic"
	"testing"
	"time"

	"backend/internal/apierrors"
)

// MockUserRepository implementa a interface UserRepository manualmente
type MockUserRepository struct {
	CreateFunc                     func(user *User) error
	GetByIDFunc                    func(id uint) (*User, error)
	GetByEmailFunc                 func(email string) (*User, error)
	GetByVerificationTokenHashFunc func(hash string) (*User, error)
	GetAllFunc                     func(query UserListQuery) (*UserListResult, error)
	UpdateFunc                     func(user *User) error
	DeleteFunc                     func(id uint) error
}

func (m *MockUserRepository) Create(user *User) error { return m.CreateFunc(user) }
func (m *MockUserRepository) GetByID(id uint) (*User, error) {
	return m.GetByIDFunc(id)
}
func (m *MockUserRepository) GetByEmail(email string) (*User, error) {
	return m.GetByEmailFunc(email)
}
func (m *MockUserRepository) GetByVerificationTokenHash(hash string) (*User, error) {
	return m.GetByVerificationTokenHashFunc(hash)
}
func (m *MockUserRepository) GetAll(query UserListQuery) (*UserListResult, error) {
	return m.GetAllFunc(query)
}
func (m *MockUserRepository) Update(user *User) error { return m.UpdateFunc(user) }
func (m *MockUserRepository) Delete(id uint) error    { return m.DeleteFunc(id) }

// MockPasswordProvider implementa providers.PasswordProvider manualmente
type MockPasswordProvider struct {
	HashFunc    func(password string) (string, error)
	CompareFunc func(hashedPassword string, password string) error
}

func (m *MockPasswordProvider) Hash(password string) (string, error) { return m.HashFunc(password) }
func (m *MockPasswordProvider) Compare(hashedPassword string, password string) error {
	return m.CompareFunc(hashedPassword, password)
}

// MockTokenProvider implementa providers.TokenProvider manualmente
type MockTokenProvider struct {
	GenerateFunc func() (string, string, error)
	HashFunc     func(raw string) string
}

func (m *MockTokenProvider) Generate() (string, string, error) { return m.GenerateFunc() }
func (m *MockTokenProvider) Hash(raw string) string            { return m.HashFunc(raw) }

// MockMailProvider implementa providers.MailProvider manualmente
type MockMailProvider struct {
	SendVerificationEmailFunc func(to string, name string, rawToken string) error
	Calls                     int32
}

func (m *MockMailProvider) SendVerificationEmail(to string, name string, rawToken string) error {
	atomic.AddInt32(&m.Calls, 1)
	return m.SendVerificationEmailFunc(to, name, rawToken)
}

// waitForCalls aguarda (com timeout) até o número esperado de envios de e-mail,
// já que o envio agora acontece em goroutine assíncrona.
func (m *MockMailProvider) waitForCalls(n int, timeout time.Duration) {
	deadline := time.Now().Add(timeout)
	for atomic.LoadInt32(&m.Calls) < int32(n) && time.Now().Before(deadline) {
		time.Sleep(time.Millisecond)
	}
}

// MockEmailValidationProvider implementa providers.EmailValidationProvider manualmente
type MockEmailValidationProvider struct {
	ValidateFunc func(email string) error
}

func (m *MockEmailValidationProvider) Validate(email string) error { return m.ValidateFunc(email) }

func newTestService(repo *MockUserRepository, mail *MockMailProvider) *userService {
	return &userService{
		repo:             repo,
		passwordProvider: &MockPasswordProvider{HashFunc: func(p string) (string, error) { return "hashed:" + p, nil }},
		tokenProvider: &MockTokenProvider{
			GenerateFunc: func() (string, string, error) { return "raw-token", "hashed-token", nil },
			HashFunc:     func(raw string) string { return "hashed-" + raw },
		},
		mailProvider:            mail,
		emailValidationProvider: &MockEmailValidationProvider{ValidateFunc: func(email string) error { return nil }},
	}
}

// Testa se um novo usuário é criado com EmailVerified=false e recebe o e-mail de confirmação
func TestCreateUser_NewUser_Success(t *testing.T) {
	mail := &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }}
	var created *User
	repo := &MockUserRepository{
		GetByEmailFunc: func(email string) (*User, error) {
			return nil, apierrors.ValidationError("Email não encontrado", nil)
		},
		CreateFunc: func(user *User) error {
			created = user
			return nil
		},
		UpdateFunc: func(user *User) error { return nil },
	}
	service := newTestService(repo, mail)

	safeUser, err := service.CreateUser(CreateUserRequest{Name: "Ana", Email: "ana@example.com", Password: "senhaforte"})

	if err != nil {
		t.Fatalf("erro não esperado: %v", err)
	}
	if created == nil || created.EmailVerified {
		t.Fatalf("usuário deveria ser criado com EmailVerified=false")
	}
	if created.VerificationTokenHash == "" {
		t.Fatalf("token de verificação deveria ter sido persistido")
	}
	mail.waitForCalls(1, time.Second)
	if atomic.LoadInt32(&mail.Calls) != 1 {
		t.Fatalf("esperado 1 envio de e-mail, recebido %d", atomic.LoadInt32(&mail.Calls))
	}
	if safeUser.Email != "ana@example.com" {
		t.Fatalf("safeUser inesperado: %v", safeUser)
	}
}

// Testa se cadastrar um e-mail já verificado retorna conflito
func TestCreateUser_ExistingVerified_Conflict(t *testing.T) {
	mail := &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }}
	repo := &MockUserRepository{
		GetByEmailFunc: func(email string) (*User, error) {
			return &User{Email: email, EmailVerified: true}, nil
		},
	}
	service := newTestService(repo, mail)

	_, err := service.CreateUser(CreateUserRequest{Name: "Ana", Email: "ana@example.com", Password: "senhaforte"})

	var apiErr *apierrors.APIError
	if err == nil {
		t.Fatalf("esperado erro de conflito")
	}
	if e, ok := err.(*apierrors.APIError); ok {
		apiErr = e
	}
	if apiErr == nil || apiErr.Code != "conflict" {
		t.Fatalf("esperado erro de conflito, recebido: %v", err)
	}
	if atomic.LoadInt32(&mail.Calls) != 0 {
		t.Fatalf("não deveria reenviar e-mail para conta já verificada")
	}
}

// Testa se cadastrar um e-mail existente mas não verificado reenvia o token sem
// sobrescrever nome/senha do usuário existente (evita account takeover)
func TestCreateUser_ExistingUnverified_ResendsWithoutOverwrite(t *testing.T) {
	mail := &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }}
	existing := &User{Email: "ana@example.com", Name: "Nome Original", PasswordHash: "hash-original", EmailVerified: false}
	var updated *User
	var createCalled bool
	repo := &MockUserRepository{
		GetByEmailFunc: func(email string) (*User, error) { return existing, nil },
		CreateFunc:     func(user *User) error { createCalled = true; return nil },
		UpdateFunc:     func(user *User) error { updated = user; return nil },
	}
	service := newTestService(repo, mail)

	safeUser, err := service.CreateUser(CreateUserRequest{Name: "Nome Atacante", Email: "ana@example.com", Password: "outrasenha"})

	if err != nil {
		t.Fatalf("erro não esperado: %v", err)
	}
	if createCalled {
		t.Fatalf("não deveria criar um novo usuário duplicado")
	}
	if updated == nil || updated.Name != "Nome Original" || updated.PasswordHash != "hash-original" {
		t.Fatalf("nome/senha do usuário existente não deveriam ser sobrescritos: %+v", updated)
	}
	mail.waitForCalls(1, time.Second)
	if atomic.LoadInt32(&mail.Calls) != 1 {
		t.Fatalf("esperado reenvio do e-mail de confirmação")
	}
	if safeUser.Name != "Nome Original" {
		t.Fatalf("resposta deveria refletir os dados originais, não os do request")
	}
}

// Testa a confirmação de e-mail com token válido
func TestVerifyEmail_Success(t *testing.T) {
	future := time.Now().Add(time.Hour)
	target := &User{Email: "ana@example.com", VerificationTokenHash: "hashed-raw-token", VerificationTokenExpiresAt: &future}
	var updated *User
	repo := &MockUserRepository{
		GetByVerificationTokenHashFunc: func(hash string) (*User, error) {
			if hash == "hashed-raw-token" {
				return target, nil
			}
			return nil, apierrors.NotFoundError("não encontrado", nil)
		},
		UpdateFunc: func(user *User) error { updated = user; return nil },
	}
	service := newTestService(repo, &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }})

	err := service.VerifyEmail("raw-token")

	if err != nil {
		t.Fatalf("erro não esperado: %v", err)
	}
	if updated == nil || !updated.EmailVerified {
		t.Fatalf("usuário deveria ter sido marcado como verificado")
	}
}

// Testa que um token inexistente retorna erro "não encontrado"
func TestVerifyEmail_InvalidToken(t *testing.T) {
	repo := &MockUserRepository{
		GetByVerificationTokenHashFunc: func(hash string) (*User, error) {
			return nil, apierrors.NotFoundError("não encontrado", nil)
		},
	}
	service := newTestService(repo, &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }})

	err := service.VerifyEmail("token-invalido")

	if err == nil {
		t.Fatalf("esperado erro para token inválido")
	}
}

// Testa que um token expirado é rejeitado
func TestVerifyEmail_Expired(t *testing.T) {
	past := time.Now().Add(-time.Hour)
	target := &User{Email: "ana@example.com", VerificationTokenHash: "hashed-raw-token", VerificationTokenExpiresAt: &past}
	repo := &MockUserRepository{
		GetByVerificationTokenHashFunc: func(hash string) (*User, error) { return target, nil },
	}
	service := newTestService(repo, &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }})

	err := service.VerifyEmail("raw-token")

	if err == nil {
		t.Fatalf("esperado erro para token expirado")
	}
}

// Testa que verificar um e-mail já confirmado é idempotente (retorna sucesso)
func TestVerifyEmail_AlreadyVerified_Idempotent(t *testing.T) {
	target := &User{Email: "ana@example.com", VerificationTokenHash: "hashed-raw-token", EmailVerified: true}
	updateCalled := false
	repo := &MockUserRepository{
		GetByVerificationTokenHashFunc: func(hash string) (*User, error) { return target, nil },
		UpdateFunc:                     func(user *User) error { updateCalled = true; return nil },
	}
	service := newTestService(repo, &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }})

	err := service.VerifyEmail("raw-token")

	if err != nil {
		t.Fatalf("verificar conta já confirmada deveria ser idempotente, recebido erro: %v", err)
	}
	if updateCalled {
		t.Fatalf("não deveria persistir nada para uma conta já verificada")
	}
}

// Testa que ResendVerification sempre retorna sucesso (nil), mesmo para e-mail inexistente,
// já verificado ou com cooldown/limite excedido - evita vazar quais e-mails existem
func TestResendVerification_AlwaysGeneric(t *testing.T) {
	t.Run("email inexistente", func(t *testing.T) {
		mail := &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }}
		repo := &MockUserRepository{
			GetByEmailFunc: func(email string) (*User, error) {
				return nil, apierrors.ValidationError("Email não encontrado", nil)
			},
		}
		service := newTestService(repo, mail)

		if err := service.ResendVerification("naoexiste@example.com"); err != nil {
			t.Fatalf("esperado nil, recebido: %v", err)
		}
		if atomic.LoadInt32(&mail.Calls) != 0 {
			t.Fatalf("não deveria enviar e-mail para conta inexistente")
		}
	})

	t.Run("já verificado", func(t *testing.T) {
		mail := &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }}
		repo := &MockUserRepository{
			GetByEmailFunc: func(email string) (*User, error) { return &User{Email: email, EmailVerified: true}, nil },
		}
		service := newTestService(repo, mail)

		if err := service.ResendVerification("ana@example.com"); err != nil {
			t.Fatalf("esperado nil, recebido: %v", err)
		}
		if atomic.LoadInt32(&mail.Calls) != 0 {
			t.Fatalf("não deveria reenviar e-mail para conta já verificada")
		}
	})

	t.Run("cooldown ativo", func(t *testing.T) {
		mail := &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }}
		now := time.Now()
		repo := &MockUserRepository{
			GetByEmailFunc: func(email string) (*User, error) {
				return &User{Email: email, VerificationSentAt: &now}, nil
			},
		}
		service := newTestService(repo, mail)

		if err := service.ResendVerification("ana@example.com"); err != nil {
			t.Fatalf("esperado nil, recebido: %v", err)
		}
		if atomic.LoadInt32(&mail.Calls) != 0 {
			t.Fatalf("não deveria reenviar e-mail durante o cooldown")
		}
	})

	t.Run("elegível para reenvio", func(t *testing.T) {
		mail := &MockMailProvider{SendVerificationEmailFunc: func(to, name, token string) error { return nil }}
		repo := &MockUserRepository{
			GetByEmailFunc: func(email string) (*User, error) { return &User{Email: email}, nil },
			UpdateFunc:     func(user *User) error { return nil },
		}
		service := newTestService(repo, mail)

		if err := service.ResendVerification("ana@example.com"); err != nil {
			t.Fatalf("esperado nil, recebido: %v", err)
		}
		mail.waitForCalls(1, time.Second)
		if atomic.LoadInt32(&mail.Calls) != 1 {
			t.Fatalf("esperado reenvio do e-mail de confirmação")
		}
	})
}
