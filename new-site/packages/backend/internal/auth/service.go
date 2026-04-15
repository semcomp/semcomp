
package auth

import (
	"errors"

	"backend/internal/providers"
	"backend/internal/user"

	"gorm.io/gorm"
)

var (
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
)

type AuthService interface {
	Register(request RegisterUserRequest) (*user.User, error)
	Login(request LoginUserRequest) (*user.User, string, error)
}

type authService struct {
	repo             AuthRepository
	passwordProvider providers.PasswordProvider
	jwtProvider      providers.JWTProvider
}

func NewAuthService(repo AuthRepository, passwordProvider providers.PasswordProvider, jwtProvider providers.JWTProvider) AuthService {
	return &authService{repo: repo, passwordProvider: passwordProvider, jwtProvider: jwtProvider}
}

func (s *authService) Register(request RegisterUserRequest) (*user.User, error) {
	hashed, errCrypt := s.passwordProvider.Hash(request.Password)
	if errCrypt != nil {
		return nil, errors.New("internal server error")
	}

	userRecord := user.User{
		Name:         request.Name,
		LastName:     request.LastName,
		Email:        request.Email,
		PasswordHash: string(hashed),
	}
	errCreateUser := s.repo.CreateUser(&userRecord)
	if errCreateUser != nil {
		if errors.Is(errCreateUser, gorm.ErrDuplicatedKey) {
			return nil, ErrEmailAlreadyExists
		}
		return nil, errors.New("create user failed")
	}

	return &userRecord, nil
}

func (s *authService) Login(request LoginUserRequest) (*user.User, string, error) {
	userRecord, errUser := s.repo.GetUserByEmail(request.Email)
	if errUser != nil {
		if errors.Is(errUser, gorm.ErrRecordNotFound) {
			return nil, "", ErrInvalidCredentials
		}
		return nil, "", errors.New("internal server error")
	}

	errPassword := s.passwordProvider.Compare(userRecord.PasswordHash, request.Password)
	if errPassword != nil {
		return nil, "", ErrInvalidCredentials
	}

	token, errToken := s.jwtProvider.Generate(userRecord.ID, userRecord.Email)
	if errToken != nil {
		return nil, "", errors.New("token generation failed")
	}

	return userRecord, token, nil
}
