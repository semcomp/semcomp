package user

import (
	"errors"

	"backend/internal/providers"
)

// UserService define as regras de negócio para operações relacionadas a usuários.
type UserService interface {
	CreateUser(user *User) error
	GetAllUsers() ([]User, error)
	GetUserByID(id uint) (*User, error)
	UpdateUser(user *User) error
	DeleteUser(id uint) error
}

// userService é a implementação concreta de UserService.
type userService struct {
	repo             UserRepository
	passwordProvider providers.PasswordProvider
}

// NewUserService inicializa e retorna uma nova instância de UserService.
func NewUserService(repo UserRepository, passwordProvider providers.PasswordProvider) UserService {
	return &userService{repo: repo, passwordProvider: passwordProvider}
}

// CreateUser valida duplicatas, criptografa a senha e salva o novo usuário.
func (s *userService) CreateUser(user *User) error {
	_, err := s.repo.GetByEmail(user.Email)
	// TODO: Ajustar a busca no GetByEmail para ignorar o Soft Delete do GORM usando .Unscoped()
	// Atualmente, ele retorna o erro de constraint do SQL em vez da nossa mensagem.
	if err == nil {
		return errors.New("e-mail já cadastrado")
	}

	hashedPassword, err := s.passwordProvider.Hash(user.PasswordHash)
	if err != nil {
		return errors.New("erro ao processar a senha")
	}
	user.PasswordHash = hashedPassword

	return s.repo.Create(user)
}

// GetAllUsers recupera todos os usuários repassando a chamada para a camada de repositório.
func (s *userService) GetAllUsers() ([]User, error) {
	return s.repo.GetAll()
}

// GetUserByID busca e retorna um usuário específico pelo seu ID.
func (s *userService) GetUserByID(id uint) (*User, error) {
	return s.repo.GetByID(id)
}

// UpdateUser aplica regras de negócio de edição e atualiza um usuário existente.
func (s *userService) UpdateUser(user *User) error {
	return s.repo.Update(user)
}

// DeleteUser remove um usuário do sistema a partir do seu ID.
func (s *userService) DeleteUser(id uint) error {
	return s.repo.Delete(id)
}
