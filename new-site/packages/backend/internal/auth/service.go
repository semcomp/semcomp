
package auth
import (
	"errors"
	"os"
	"strconv"
	"time"

	"backend/internal/user"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
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
	repo AuthRepository
}

func NewAuthService(repo AuthRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) Register(request RegisterUserRequest) (*user.User, error) {
	hashed, errCrypt := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
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

	errPassword := bcrypt.CompareHashAndPassword([]byte(userRecord.PasswordHash), []byte(request.Password))
	if errPassword != nil {
		return nil, "", ErrInvalidCredentials
	}

	token, errToken := GenerateJWT(*userRecord)
	if errToken != nil {
		return nil, "", errors.New("token generation failed")
	}

	return userRecord, token, nil
}

func GenerateJWT(userRecord user.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("jwt secret not configured")
	}
	hours, err := strconv.Atoi(os.Getenv("JWT_EXPIRES_IN_HOURS"))
	if err != nil {
		hours = 24
	}

	claims := JWTClaims{
		UserID: userRecord.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userRecord.Email,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(hours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
