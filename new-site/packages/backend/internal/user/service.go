package user

import (
	"errors"

	"backend/internal/providers"
)

// UserService define as regras de negócio para operações relacionadas a usuários.
type UserService interface {
	CreateUser(request CreateUserRequest) (*SafeUser, error)
	GetAllUsers() ([]SafeUser, error)
	GetUserByID(id uint) (*SafeUser, error)
	UpdateUser(id uint, request UpdateUserRequest) error
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
func (s *userService) CreateUser(request CreateUserRequest) (*SafeUser, error) {
	_, err := s.repo.GetByEmail(request.Email)
	// TODO: Ajustar a busca no GetByEmail para ignorar o Soft Delete do GORM usando .Unscoped()
	// Atualmente, ele retorna o erro de constraint do SQL em vez da nossa mensagem.
	if err == nil {
		return nil, errors.New("e-mail já cadastrado")
	}

	hashedPassword, err := s.passwordProvider.Hash(request.Password)
	if err != nil {
		return nil, errors.New("erro ao processar a senha")
	}

	newUser := User{
		Name:         request.Name,
		LastName:     request.LastName,
		Email:        request.Email,
		PasswordHash: hashedPassword,
	}

	if err := s.repo.Create(&newUser); err != nil {
		return nil, err
	}

	safe := ToSafeUser(&newUser)
	return &safe, nil
}

// GetAllUsers recupera todos os usuários repassando a chamada para a camada de repositório.
func (s *userService) GetAllUsers() ([]SafeUser, error) {
	users, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	return ToSafeUsers(users), nil
}

// GetUserByID busca e retorna um usuário específico pelo seu ID.
func (s *userService) GetUserByID(id uint) (*SafeUser, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	safe := ToSafeUser(user)
	return &safe, nil
}

// UpdateUser aplica regras de negócio de edição e atualiza um usuário existente.
func (s *userService) UpdateUser(id uint, request UpdateUserRequest) error {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	user.Name = request.Name
	user.LastName = request.LastName
	user.Email = request.Email

	if request.Password != "" {
		hashedPassword, err := s.passwordProvider.Hash(request.Password)
		if err != nil {
			return errors.New("erro ao processar a senha")
		}
		user.PasswordHash = hashedPassword
	}

	return s.repo.Update(user)
}

// DeleteUser remove um usuário do sistema a partir do seu ID.
func (s *userService) DeleteUser(id uint) error {
	return s.repo.Delete(id)
}
