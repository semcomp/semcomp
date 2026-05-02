package userBackoffice

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"backend/internal/providers"
)

type UserBackofficeService interface {
	InitializeAdmin() error
	CreateUser(request CreateUserBackofficeRequest) (*SafeUserB, error)
	GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserBListResult, error)
	GetUserByEmail(email string) (*SafeUserB, error)
	UpdateUser(email string, request UpdateUserBackofficeRequest) error
	DeleteUser(email string) error
}

type userBackofficeService struct {
	repo             UserBackofficeRepository
	passwordProvider providers.PasswordProvider
}

func NewUserBackofficeService(repo UserBackofficeRepository, passwordProvider providers.PasswordProvider) UserBackofficeService {
	return &userBackofficeService{repo: repo, passwordProvider: passwordProvider}
}

func (s *userBackofficeService) InitializeAdmin() error {
	email := os.Getenv("ADMIN_EMAIL")
	password := os.Getenv("ADMIN_PASSWORD")

	_, err := s.repo.GetByEmail(email)
	if err == nil {
		return nil
	}

	admin := CreateUserBackofficeRequest{
		Email:      email,
		Password: 	password,
	}

	_, err = s.CreateUser(admin)
	if err != nil {
		return errors.New("erro na inicialização do backoffice")
	}

	return nil
}

func (s *userBackofficeService) CreateUser(request CreateUserBackofficeRequest) (*SafeUserB, error) {
	_, err := s.repo.GetByEmail(request.Email)
	if err == nil {
		return nil, errors.New("e-mail já cadastrado")
	}

	hashedPassword, err := s.passwordProvider.Hash(request.Password)
	if err != nil {
		return nil, errors.New("erro ao processar a senha")
	}

	newUser := UserBackoffice{
		Email:        request.Email,
		PasswordHash: hashedPassword,
	}

	if err := s.repo.Create(&newUser); err != nil {
		return nil, err
	}

	safe := ToSafeUserB(&newUser)
	return &safe, nil
}

func (s *userBackofficeService) GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserBListResult, error) {

	if page < 1 {
		return nil, fmt.Errorf("page must be greater than 0")
	}

	if limit < 1 {
		return nil, fmt.Errorf("limit must be greater than 0")
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
		"email":         true,
	}

	if !allowedSortFields[sortBy] {
		return nil, fmt.Errorf("invalid sort_by parameter")
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, fmt.Errorf("invalid sort_order parameter")
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, fmt.Errorf("search_by and search_value must be provided together")
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"email":         true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("invalid search_by parameter")
		}
	}

	offset := (page - 1) * limit

	query := UserBListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	usersB, err := s.repo.GetAll(query)
	if err != nil {
		return nil, err
	}

	return usersB, nil
}

func (s *userBackofficeService) GetUserByEmail(email string) (*SafeUserB, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, err
	}

	safe := ToSafeUserB(user)
	return &safe, nil
}

// UpdateUser aplica regras de negócio de edição e atualiza um usuário existente.
func (s *userBackofficeService) UpdateUser(email string, request UpdateUserBackofficeRequest) error {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return err
	}

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
func (s *userBackofficeService) DeleteUser(email string) error {
	return s.repo.Delete(email)
}
