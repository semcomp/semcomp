package repository

import (
	"errors"
	"gorm.io/gorm"

	"backend/internal/models"
)

// UserRepository define as operações de acesso a dados para a entidade User.
type UserRepository interface {
	Create(user *models.User) error
	GetByID(id uint) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
}

// userRepository é a implementação de UserRepository baseada no GORM.
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository inicializa e retorna uma nova instância de UserRepository.
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// Create insere um novo registro de usuário no banco de dados.
func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// GetByID busca um usuário pelo ID único especificado.
func (r *userRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("usuário não encontrado")
	}
	
	return &user, err
}

// GetByEmail busca um usuário que corresponda ao email informado.
func (r *userRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("usuário não encontrado")
	}
	
	return &user, err
}