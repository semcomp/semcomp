package auth

import (
	"backend/internal/user"

	"gorm.io/gorm"
)

type AuthRepository interface {
	CreateUser(user *user.User) error
	GetUserByEmail(email string) (*user.User, error)
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) CreateUser(user *user.User) error {
	return r.db.Create(user).Error
}

func (r *authRepository) GetUserByEmail(email string) (*user.User, error) {
	var userRecord user.User
	err := r.db.Where("email = ?", email).First(&userRecord).Error
	return &userRecord, err
}
