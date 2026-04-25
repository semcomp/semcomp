package providers

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTProvider interface {
	Generate(userID uint, email string) (string, error)
	Parse(token string) (*AuthTokenClaims, error)
}

type AuthTokenClaims struct {
	UserNumber uint
	Email      string
}

var (
	ErrJWTSecretNotConfigured = errors.New("jwt secret not configured")
	ErrInvalidToken           = errors.New("invalid or expired token")
	ErrInvalidTokenClaims     = errors.New("invalid token claims")
)

type jwtProvider struct{}

func NewJWTProvider() JWTProvider {
	return &jwtProvider{}
}

func (p *jwtProvider) Generate(userID uint, email string) (string, error) {
	secret, errSecret := getJWTSecret()
	if errSecret != nil {
		return "", errSecret
	}
	hours, err := strconv.Atoi(os.Getenv("JWT_EXPIRES_IN_HOURS"))
	if err != nil {
		hours = 24
	}

	claims := jwt.MapClaims{
		"id":    userID,
		"sub":   email,
		"exp":   time.Now().Add(time.Duration(hours) * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
		"email": email,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func (p *jwtProvider) Parse(token string) (*AuthTokenClaims, error) {
	secret, errSecret := getJWTSecret()
	if errSecret != nil {
		return nil, errSecret
	}

	parsedToken, errParse := jwt.Parse(token, func(t *jwt.Token) (any, error) {
		_, ok := t.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}

		return []byte(secret), nil
	})
	if errParse != nil || !parsedToken.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return nil, ErrInvalidTokenClaims
	}

	idFloat, ok := claims["id"].(float64)
	if !ok {
		return nil, ErrInvalidTokenClaims
	}

	email, ok := claims["sub"].(string)
	if !ok || email == "" {
		return nil, ErrInvalidTokenClaims
	}

	return &AuthTokenClaims{UserNumber: uint(idFloat), Email: email}, nil
}

func getJWTSecret() (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", ErrJWTSecretNotConfigured
	}

	return secret, nil
}
