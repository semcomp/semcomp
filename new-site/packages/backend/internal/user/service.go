package user

import (
	"errors"
	"strconv"
	"strings"

	"backend/internal/apierrors"
	"backend/internal/providers"
)

var (
	ErrEmailAlreadyExists  = errors.New("email já cadastrado")
	ErrInvalidCredentials  = errors.New("email e/ou senha inválido(s)")
	ErrTokenGeneration     = errors.New("geração do token falhou")
	ErrInternalServerError = errors.New("erro interno")
)

// UserService define as regras de negócio para operações relacionadas a usuários.
type UserService interface {
	CreateUser(request CreateUserRequest) (*SafeUser, error)
	GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserListResult, error)
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
	if err == nil {
		return nil, apierrors.ConflictError("Email já cadastrado", err)
	}

	hashedPassword, err := s.passwordProvider.Hash(request.Password)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao processar a senha", err)
	}

	newUser := User{
		Name:         request.Name,
		Email:        request.Email,
		PasswordHash: hashedPassword,
		PresenceRate: 0.0,
	}

	if err := s.repo.Create(&newUser); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar usuário", err)
	}

	safe := ToSafeUser(&newUser)
	return &safe, nil
}

// GetAllUsers recupera todos os usuários repassando a chamada para a camada de repositório.
func (s *userService) GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserListResult, error) {

	if page < 1 {
		return nil, apierrors.ValidationError("Valor de 'page' inválido", nil)
	}

	if limit < 1 {
		return nil, apierrors.ValidationError("Valor de 'limit' inválido", nil)
	}

	if sortBy == "" {
		sortBy = "name"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	// Definição dos campos possíveis para ordenação
	allowedSortFields := map[string]bool{
		"name":          true,
		"email":         true,
		"presence_rate": true,
		"user_number":   true,
	}

	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parâmetro 'sort_by' inválido", nil)
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("Parâmetro 'sort_order' inválido", nil)
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("Para realizar uma busca, envie 'search_by' juntamente com 'search_value' ", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"name":          true,
			"email":         true,
			"presence_rate": true,
			"user_number":   true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parâmetro 'search_by' inválido", nil)
		}

		if searchBy == "presence_rate" {
			if _, err := strconv.ParseFloat(searchValue, 64); err != nil {
				return nil, apierrors.ValidationError("Valor inválido para busca por 'presence_rate' ", nil)
			}
		}

		if searchBy == "user_number" {
			if _, err := strconv.Atoi(searchValue); err != nil {
				return nil, apierrors.ValidationError("Valor inválido para busca por 'user_number' ", nil)
			}
		}
	}

	offset := (page - 1) * limit

	query := UserListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	users, err := s.repo.GetAll(query)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao recuperar usuários", err)
	}

	return users, nil
}

// GetUserByID busca e retorna um usuário específico pelo seu ID.
func (s *userService) GetUserByID(id uint) (*SafeUser, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar usuário", err)
	}

	safe := ToSafeUser(user)
	return &safe, nil
}

// UpdateUser aplica regras de negócio de edição e atualiza um usuário existente.
func (s *userService) UpdateUser(id uint, request UpdateUserRequest) error {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return apierrors.InternalServerError("Erro ao buscar usuário", err)
	}

	user.Name = request.Name
	user.Email = request.Email
	user.PresenceRate = request.PresenceRate // TODO: adicionar lógica para contabilização da presença

	if request.Password != "" {
		hashedPassword, err := s.passwordProvider.Hash(request.Password)
		if err != nil {
			return apierrors.InternalServerError("Erro ao processar a senha", err)
		}
		user.PasswordHash = hashedPassword
	}

	return s.repo.Update(user)
}

// DeleteUser remove um usuário do sistema a partir do seu ID.
func (s *userService) DeleteUser(id uint) error {
	return s.repo.Delete(id)
}
