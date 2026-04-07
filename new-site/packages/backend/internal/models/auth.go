package models

import "github.com/golang-jwt/jwt/v5"

// Uso validator para validar os campos de entrada
type RegisterUserRequest struct {
	Name     string `json:"name"     validate:"required,min=3"`
	LastName string `json:"last_name" validate:"required,min=3"`
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type JWTClaims struct {
	UserID uint `json:"id"`
	jwt.RegisteredClaims
}
