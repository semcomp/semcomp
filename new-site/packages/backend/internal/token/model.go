package token

import (
	"errors"
	"time"
)

type TokenType string

const (
	EmailVerification TokenType = "email_verification"
	PasswordReset     TokenType = "password_reset"
)

var (
	ErrInvalidToken = errors.New("token inválido")
	ErrTokenExpired = errors.New("token expirado")
	ErrTokenUsed    = errors.New("token já utilizado")
)

type Token struct {
	ID        uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint       `gorm:"not null;index:idx_user_type" json:"user_id"`
	TokenHash string     `gorm:"size:64;not null;index" json:"-"`
	Type      TokenType  `gorm:"size:50;not null;index:idx_user_type" json:"type"`
	ExpiresAt time.Time  `gorm:"not null" json:"expires_at"`
	UsedAt    *time.Time `json:"used_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}
