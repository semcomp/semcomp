package authBackoffice

import (
	"errors"

	"backend/internal/apierrors"
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
	userBackofficeRepository userBackoffice.UserBackofficeRepository
	passwordProvider         providers.PasswordProvider
	jwtProvider              providers.JWTProvider
}

func NewAuthBackofficeService(userBackofficeRepository userBackoffice.UserBackofficeRepository, passwordProvider providers.PasswordProvider, jwtProvider providers.JWTProvider) AuthBackofficeService {
	return &authBackofficeService{userBackofficeRepository: userBackofficeRepository, passwordProvider: passwordProvider, jwtProvider: jwtProvider}
}

func (s *authBackofficeService) Login(request LoginUserBackofficeRequest) (*userBackoffice.UserBackoffice, string, error) {
	backofficeRecord, errUser := s.userBackofficeRepository.GetByEmail(request.Email)
	if errUser != nil {
		if errors.Is(errUser, gorm.ErrRecordNotFound) {
			return nil, "", apierrors.UnauthorizedError("Credenciais inválidas", errUser)
		}
		return nil, "", apierrors.InternalServerError("Erro ao buscar usuário", errUser)
	}

	errPassword := s.passwordProvider.Compare(backofficeRecord.PasswordHash, request.Password)
	if errPassword != nil {
		return nil, "", apierrors.UnauthorizedError("Credenciais inválidas", errPassword)
	}

	token, errToken := s.jwtProvider.GenerateToBackoffice(backofficeRecord.Email)
	if errToken != nil {
		return nil, "", apierrors.InternalServerError("Erro ao gerar token de autenticação", errToken)
	}

	return backofficeRecord, token, nil
}
