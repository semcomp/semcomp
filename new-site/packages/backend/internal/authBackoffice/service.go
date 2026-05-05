package authBackoffice

import (
	"errors"

	"backend/internal/providers"
	"backend/internal/userBackoffice"

	"gorm.io/gorm"
)

var (
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
)

type AuthBackofficeService interface {
	Login(request LoginUserBackofficeRequest) (*userBackoffice.UserBackoffice, string, error)
}

type authBackofficeService struct {
	userBackofficeRepository   userBackoffice.UserBackofficeRepository
	passwordProvider providers.PasswordProvider
	jwtProvider      providers.JWTProvider
}

func NewAuthBackofficeService(userBackofficeRepository userBackoffice.UserBackofficeRepository, passwordProvider providers.PasswordProvider, jwtProvider providers.JWTProvider) AuthBackofficeService {
	return &authBackofficeService{userBackofficeRepository: userBackofficeRepository, passwordProvider: passwordProvider, jwtProvider: jwtProvider}
}

func (s *authBackofficeService) Login(request LoginUserBackofficeRequest) (*userBackoffice.UserBackoffice, string, error) {
	backofficeRecord, errUser := s.userBackofficeRepository.GetByEmail(request.Email)
	if errUser != nil {
		if errors.Is(errUser, gorm.ErrRecordNotFound) {
			return nil, "", ErrInvalidCredentials
		}
		return nil, "", errors.New("internal server error")
	}

	errPassword := s.passwordProvider.Compare(backofficeRecord.PasswordHash, request.Password)
	if errPassword != nil {
		return nil, "", ErrInvalidCredentials
	}

	token, errToken := s.jwtProvider.GenerateToBackoffice(backofficeRecord.Email)
	if errToken != nil {
		return nil, "", errors.New("token generation failed")
	}

	return backofficeRecord, token, nil
}
