
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
	Login(request LoginUserRequest) (*user.User, string, error)
}

type authService struct {
	userRepository   user.UserRepository
	passwordProvider providers.PasswordProvider
	jwtProvider      providers.JWTProvider
}

func NewAuthService(userRepository user.UserRepository, passwordProvider providers.PasswordProvider, jwtProvider providers.JWTProvider) AuthService {
	return &authService{userRepository: userRepository, passwordProvider: passwordProvider, jwtProvider: jwtProvider}
}

func (s *authService) Login(request LoginUserRequest) (*user.User, string, error) {
	userRecord, errUser := s.userRepository.GetByEmail(request.Email)
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

	token, errToken := s.jwtProvider.Generate(userRecord.UserNumber, userRecord.Email)
	if errToken != nil {
		return nil, "", errors.New("token generation failed")
	}

	return userRecord, token, nil
}
