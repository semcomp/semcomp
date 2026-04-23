package user

import (
	"errors"
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

// UserRepository define as operações de acesso a dados para a entidade User.
type UserRepository interface {
	Create(user *User) error
	GetByID(id uint) (*User, error)
	GetByEmail(email string) (*User, error)
	GetAll(query UserListQuery) (*UserListResult, error)
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

func applySearchFilter(dbQuery *gorm.DB, query UserListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "user_number":
		return dbQuery.Where("user_number ILIKE ?", "%"+query.SearchValue+"%")
	case "name":
		return dbQuery.Where("name ILIKE ?", "%"+query.SearchValue+"%")
	case "email":
		return dbQuery.Where("email ILIKE ?", "%"+query.SearchValue+"%")
	case "presence_rate":
		return dbQuery.Where("presence_rate ILIKE ?", "%"+query.SearchValue+"%")
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"name",
		"email",
		"presence_rate",
		"user_number",
	}

	field := strings.ToLower(sortBy)
	isAllowedField := slices.Contains(allowedSortFields, field)
	if !isAllowedField {
		return "", fmt.Errorf("invalid sort field")
	}

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}

	return field + " " + order, nil
}


// GetAll retorna uma lista de todos os usuários cadastrados, com os devidos filtros e 
// ordenações aplicados.
func (r *userRepository) GetAll(query UserListQuery) (*UserListResult, error) {
	var users []User
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&User{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(r.db.Model(&User{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&User{}), query)
	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&users).Error
	if err != nil {
		return nil, err
	}

	return &UserListResult{
		Users:       		ToSafeUsers(users),
		TotalRecords:    	totalRecords,
		FilteredRecords: 	filteredRecords,
	}, nil
}

// Update salva as modificações de um registro de usuário existente no banco de dados.
func (r *userRepository) Update(user *User) error {
	return r.db.Save(user).Error
}

// Delete realiza a exclusão de um usuário identificando-o pelo ID.
func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&User{}, id).Error
}
