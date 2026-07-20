package token

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type Repository interface {
	Create(token *Token) error
	FindByHash(hash string) (*Token, error)
	MarkUsed(id uint) error
	DeleteByUserAndType(userID uint, tokenType TokenType) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(token *Token) error {
	return r.db.Create(token).Error
}

func (r *repository) FindByHash(hash string) (*Token, error) {
	var t Token
	err := r.db.Where("token_hash = ?", hash).First(&t).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidToken
		}
		return nil, err
	}
	return &t, nil
}

func (r *repository) MarkUsed(id uint) error {
	now := time.Now()
	result := r.db.Model(&Token{}).Where("id = ?", id).Update("used_at", &now)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrInvalidToken
	}
	return nil
}

func (r *repository) DeleteByUserAndType(userID uint, tokenType TokenType) error {
	return r.db.Where("user_id = ? AND type = ?", userID, tokenType).Delete(&Token{}).Error
}
