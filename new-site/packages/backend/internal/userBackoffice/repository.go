package userBackoffice

import (
	"errors"
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

type UserBackofficeRepository interface {
	Create(user *UserBackoffice) error
	GetByEmail(email string) (*UserBackoffice, error)
	GetAll(query UserBListQuery) (*UserBListResult, error)
	Update(user *UserBackoffice) error
	Delete(email string) error
}

type userBackofficeRepository struct {
	db *gorm.DB
}

func NewUserBackofficeRepository(db *gorm.DB) UserBackofficeRepository {
	return &userBackofficeRepository{db: db}
}

func (r *userBackofficeRepository) Create(userB *UserBackoffice) error {
	return r.db.Create(userB).Error
}

func (r *userBackofficeRepository) GetByEmail(email string) (*UserBackoffice, error) {
	var user UserBackoffice
	err := r.db.Where("email = ?", email).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("usuário não encontrado")
	}

	return &user, err
}

func applySearchFilter(dbQuery *gorm.DB, query UserBListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
		case "email":
			return dbQuery.Where("email ILIKE ?", "%"+query.SearchValue+"%")
		default:
			return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"email",
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

func (r *userBackofficeRepository) GetAll(query UserBListQuery) (*UserBListResult, error) {
	var users []UserBackoffice
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&UserBackoffice{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(r.db.Model(&UserBackoffice{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&UserBackoffice{}), query)
	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&users).Error
	if err != nil {
		return nil, err
	}

	return &UserBListResult{
		Users:           ToSafeUsersB(users),
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

func (r *userBackofficeRepository) Update(userB *UserBackoffice) error {
	return r.db.Save(userB).Error
}

func (r *userBackofficeRepository) Delete(email string) error {
	return r.db.Delete(&UserBackoffice{}, email).Error
}
