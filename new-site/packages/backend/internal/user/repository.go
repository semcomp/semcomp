package user

import (
	"errors"

	"gorm.io/gorm"
)

// UserRepository define as operações de acesso a dados para a entidade User.
type UserRepository interface {
	Create(user *User) error
	GetByID(id uint) (*User, error)
	GetByEmail(email string) (*User, error)
	GetAll() ([]User, error)
	Update(user *User) error
	Delete(id uint) error
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
func (r *userRepository) Create(user *User) error {
	return r.db.Create(user).Error
}

// GetByID busca um usuário pelo ID único especificado.
func (r *userRepository) GetByID(id uint) (*User, error) {
	var user User
	err := r.db.First(&user, id).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("usuário não encontrado")
	}

	return &user, err
}

// GetByEmail busca um usuário que corresponda ao email informado.
func (r *userRepository) GetByEmail(email string) (*User, error) {
	var user User
	err := r.db.Where("email = ?", email).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("usuário não encontrado")
	}

	return &user, err
}

// GetAll retorna uma lista de todos os usuários cadastrados.
func (r *userRepository) GetAll() ([]User, error) {
	var users []User
	err := r.db.Find(&users).Error
	return users, err
}

// Update salva as modificações de um registro de usuário existente no banco de dados.
func (r *userRepository) Update(user *User) error {
	return r.db.Save(user).Error
}

// Delete realiza a exclusão de um usuário identificando-o pelo ID.
func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&User{}, id).Error
}
