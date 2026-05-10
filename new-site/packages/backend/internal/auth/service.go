package auth

import (
	"errors"

	"backend/internal/providers"
	"backend/internal/user"
)

type AuthService interface {
	Login(request LoginUserRequest) (*user.SafeUser, string, error)
}

type authService struct {
	userRepository   user.UserRepository
	passwordProvider providers.PasswordProvider
	jwtProvider      providers.JWTProvider
}

func NewAuthService(userRepository user.UserRepository, passwordProvider providers.PasswordProvider, jwtProvider providers.JWTProvider) AuthService {
	return &authService{userRepository: userRepository, passwordProvider: passwordProvider, jwtProvider: jwtProvider}
}

func (s *authService) Login(request LoginUserRequest) (*user.SafeUser, string, error) {
	userRecord, errUser := s.userRepository.GetByEmail(request.Email)
	if errUser != nil {
		if errors.Is(errUser, user.ErrInvalidCredentials) {
			return nil, "", user.ErrInvalidCredentials
		}
		return nil, "", user.ErrInternalServerError
	}

	errPassword := s.passwordProvider.Compare(userRecord.PasswordHash, request.Password)
	if errPassword != nil {
		return nil, "", user.ErrInvalidCredentials
	}

	token, errToken := s.jwtProvider.Generate(userRecord.UserNumber, userRecord.Email)
	if errToken != nil {
		return nil, "", user.ErrTokenGeneration
	}

	safeUser := user.ToSafeUser(userRecord)
	return &safeUser, token, nil
}
