package user

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"backend/internal/mailer"
	"backend/internal/providers"
	"backend/internal/token"
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

	VerifyEmail(tokenPlain string, userID uint) error
	RequestPasswordReset(email string) error
	ResetPassword(tokenPlain string, newPassword string) error
}

// userService é a implementação concreta de UserService.
type userService struct {
	repo             UserRepository
	passwordProvider providers.PasswordProvider
	tokenRepo        token.Repository
	mailer           *mailer.Mailer
}

// NewUserService inicializa e retorna uma nova instância de UserService.
func NewUserService(repo UserRepository, passwordProvider providers.PasswordProvider, tokenRepo token.Repository, mailer *mailer.Mailer) UserService {
	return &userService{
		repo:             repo,
		passwordProvider: passwordProvider,
		tokenRepo:        tokenRepo,
		mailer:           mailer,
	}
}

// CreateUser valida duplicatas, criptografa a senha e salva o novo usuário.
func (s *userService) CreateUser(request CreateUserRequest) (*SafeUser, error) {
	_, err := s.repo.GetByEmail(request.Email)
	if err == nil {
		return nil, ErrEmailAlreadyExists
	}

	hashedPassword, err := s.passwordProvider.Hash(request.Password)
	if err != nil {
		return nil, errors.New("erro ao processar a senha")
	}

	newUser := User{
		Name:          request.Name,
		Email:         request.Email,
		PasswordHash:  hashedPassword,
		PresenceRate:  0.0,
		EmailVerified: false,
	}

	if err := s.repo.Create(&newUser); err != nil {
		return nil, err
	}

	plainToken, hash, err := token.GenerateToken()
	if err != nil {
		return nil, ErrTokenGeneration
	}

	verificationToken := token.Token{
		UserID:    newUser.UserNumber,
		TokenHash: hash,
		Type:      token.EmailVerification,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := s.tokenRepo.Create(&verificationToken); err != nil {
		return nil, err
	}

	s.mailer.SendVerificationEmail(newUser.Name, newUser.Email, plainToken)

	safe := ToSafeUser(&newUser)
	return &safe, nil
}

// GetAllUsers recupera todos os usuários repassando a chamada para a camada de repositório.
func (s *userService) GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserListResult, error) {

	if page < 1 {
		return nil, fmt.Errorf("Valor de 'page' inválido")
	}

	if limit < 1 {
		return nil, fmt.Errorf("Valor de 'limit' inválido")
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
		return nil, fmt.Errorf("Parâmetro 'sort_by' inválido")
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, fmt.Errorf("Parâmetro 'sort_order' inválido")
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, fmt.Errorf("Para realizar uma busca, envie 'search_by' juntamente com 'search_value' ")
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
			return nil, fmt.Errorf("Parâmetro 'search_by' inválido")
		}

		if searchBy == "presence_rate" {
			if _, err := strconv.ParseFloat(searchValue, 64); err != nil {
				return nil, fmt.Errorf("Valor inválido para busca por 'presence_rate' ")
			}
		}

		if searchBy == "user_number" {
			if _, err := strconv.Atoi(searchValue); err != nil {
				return nil, fmt.Errorf("Valor inválido para busca por 'user_number' ")
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
		return nil, err
	}

	return users, nil
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
	user.Email = request.Email
	user.PresenceRate = request.PresenceRate // TODO: adicionar lógica para contabilização da presença

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

func (s *userService) VerifyEmail(tokenPlain string, userID uint) error {
	hash := token.HashToken(tokenPlain)

	t, err := s.tokenRepo.FindByHash(hash)
	if err != nil {
		return err
	}

	if t.UserID != userID {
		return token.ErrInvalidToken
	}

	if t.UsedAt != nil {
		return token.ErrTokenUsed
	}

	if time.Now().After(t.ExpiresAt) {
		return token.ErrTokenExpired
	}

	user, err := s.repo.GetByID(t.UserID)
	if err != nil {
		return ErrInternalServerError
	}

	user.EmailVerified = true
	if err := s.repo.Update(user); err != nil {
		return err
	}

	return s.tokenRepo.MarkUsed(t.ID)
}

func (s *userService) RequestPasswordReset(email string) error {
	userRecord, err := s.repo.GetByEmail(email)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			return nil
		}
		return err
	}

	if err := s.tokenRepo.DeleteByUserAndType(userRecord.UserNumber, token.PasswordReset); err != nil {
		return err
	}

	plainToken, hash, err := token.GenerateToken()
	if err != nil {
		return ErrTokenGeneration
	}

	resetToken := token.Token{
		UserID:    userRecord.UserNumber,
		TokenHash: hash,
		Type:      token.PasswordReset,
		ExpiresAt: time.Now().Add(30 * time.Minute),
	}

	if err := s.tokenRepo.Create(&resetToken); err != nil {
		return err
	}

	s.mailer.SendPasswordResetEmail(userRecord.Name, userRecord.Email, plainToken)

	return nil
}

func (s *userService) ResetPassword(tokenPlain string, newPassword string) error {
	hash := token.HashToken(tokenPlain)

	t, err := s.tokenRepo.FindByHash(hash)
	if err != nil {
		return err
	}

	if t.UsedAt != nil {
		return token.ErrTokenUsed
	}

	if time.Now().After(t.ExpiresAt) {
		return token.ErrTokenExpired
	}

	user, err := s.repo.GetByID(t.UserID)
	if err != nil {
		return ErrInternalServerError
	}

	hashedPassword, err := s.passwordProvider.Hash(newPassword)
	if err != nil {
		return errors.New("erro ao processar a senha")
	}

	user.PasswordHash = hashedPassword
	if err := s.repo.Update(user); err != nil {
		return err
	}

	return s.tokenRepo.MarkUsed(t.ID)
}
