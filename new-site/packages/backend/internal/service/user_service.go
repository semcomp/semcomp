package service

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
	
	"backend/internal/models"
	"backend/internal/repository"
)

// UserService define as regras de negócio para operações relacionadas a usuários.
type UserService interface {
	CreateUser(user *models.User) error
}

// userService é a implementação concreta de UserService.
type userService struct {
	repo repository.UserRepository
}

// NewUserService inicializa e retorna uma nova instância de UserService.
func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

// CreateUser valida duplicatas, criptografa a senha e salva o novo usuário.
func (s *userService) CreateUser(user *models.User) error {
	_, err := s.repo.GetByEmail(user.Email)
	if err == nil {
		return errors.New("e-mail já cadastrado")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("erro ao processar a senha")
	}
	user.PasswordHash = string(hashedPassword)

	return s.repo.Create(user)
}