package permission

import (
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

type PermissionRepository interface {
	Create(permission *Permission) error
	GetByUser(user string) ([]Permission, error)
	GetBySection(section string) ([]Permission, error)
	DeleteByUserSection(user string, section string) error
	UpdateByUserSection(user string, section string, updatedPermission *Permission) error
	GetPermissions(query PermissionListQuery) (*PermissionListResult, error)
}

type permissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) PermissionRepository {
	return &permissionRepository{db: db}
}

func (r *permissionRepository) Create(permission *Permission) error {
	return r.db.Create(permission).Error
}

// Retorna todas as permissões relativas a um usuário específico
func (r *permissionRepository) GetByUser(user string) ([]Permission, error) {
	var permissions []Permission
	err := r.db.Where("user_email = ?", user).Find(&permissions).Error
	if err != nil {
		return nil, err
	}

	return permissions, nil
}

// Retorna todas as permissões relativas a uma seção específica
func (r *permissionRepository) GetBySection(section string) ([]Permission, error) {
	var permissions []Permission
	err := r.db.Where("section_name = ?", section).Find(&permissions).Error
	if err != nil {
		return nil, err
	}

	return permissions, nil
}

func (r *permissionRepository) DeleteByUserSection(user string, section string) error {
	result := r.db.Where("user_email = ? AND section_name = ?", user, section).Delete(&Permission{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *permissionRepository) UpdateByUserSection(user string, section string, updatedPermission *Permission) error {
	result := r.db.Model(&Permission{}).
		Where("user_email = ? AND section_name = ?", user, section).
		Updates(map[string]interface{}{
			"user_email":     	updatedPermission.UserEmail,
			"section_name":  	updatedPermission.SectionName,
			"permission_type": 	updatedPermission.PermissionType,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *permissionRepository) GetPermissions(query PermissionListQuery) (*PermissionListResult, error) {
	var permissions []Permission
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Permission{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredList := applySearchFilter(r.db.Model(&Permission{}), query)
	if err := filteredList.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&Permission{}), query)
	if err := dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&permissions).Error; err != nil {
		return nil, err
	}

	return &PermissionListResult{
		Permissions:     permissions,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

func applySearchFilter(dbQuery *gorm.DB, query PermissionListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "user_email":
		return dbQuery.Where("user_email ILIKE ?", "%"+query.SearchValue+"%")
	case "section_name":
		return dbQuery.Where("section_name ILIKE ?", "%"+query.SearchValue+"%")
	case "permission_type":
		return dbQuery.Where("permission_type ILIKE ?", "%"+query.SearchValue+"%")
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"user_email",
		"section_name",
		"permission_type",
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
