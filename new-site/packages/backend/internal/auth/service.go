package auth

import (
	"errors"

	"backend/internal/apierrors"
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
		if errors.Is(errUser, apierrors.ValidationError("Email não encontrado", errUser)) {
			return nil, "", apierrors.UnauthorizedError("Credenciais inválidas", errUser)
		}
		return nil, "", apierrors.InternalServerError("Erro ao buscar usuário", errUser)
	}

	errPassword := s.passwordProvider.Compare(userRecord.PasswordHash, request.Password)
	if errPassword != nil {
		return nil, "", apierrors.UnauthorizedError("Credenciais inválidas", errPassword)
	}

	if !userRecord.EmailVerified {
		return nil, "", apierrors.ForbiddenError("E-mail ainda não verificado. Verifique sua caixa de entrada ou solicite um novo link de confirmação.", nil)
	}

	token, errToken := s.jwtProvider.Generate(userRecord.UserNumber, userRecord.Email)
	if errToken != nil {
		return nil, "", apierrors.InternalServerError("Erro ao gerar token de autenticação", errToken)
	}

	safeUser := user.ToSafeUser(userRecord)
	return &safeUser, token, nil
}
