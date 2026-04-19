package auth

import "github.com/golang-jwt/jwt/v5"

type LoginUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type JWTClaims struct {
	UserID uint `json:"id"`
	jwt.RegisteredClaims
}
