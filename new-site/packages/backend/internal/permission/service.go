package permission

import (
	"errors"
	"fmt"
	"strings"

	"gorm.io/gorm"
)

var (
	ErrPermissionNotFound = errors.New("permission not found")
)

type PermissionService interface {
	CreatePermission(request PermissionRequest) (*Permission, error)
	GetPermissionByUser(user string) ([]Permission, error)
	GetPermissionBySection(section string) ([]Permission, error)
	DeletePermissionByUserSection(user string, section string) error
	UpdatePermissionByUserSection(user string, section string, request PermissionRequest) error
	GetPermissions(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*PermissionListResult, error)
}

type permissionService struct {
	repo PermissionRepository
}

func NewPermissionService(repo PermissionRepository) PermissionService {
	return &permissionService{repo: repo}
}

func (s *permissionService) CreatePermission(request PermissionRequest) (*Permission, error) {
	newPermission := Permission{
		UserEmail:      request.UserEmail,
		SectionName:    request.SectionName,
		PermissionType: request.PermissionType,
	}

	err := s.repo.Create(&newPermission)
	if err != nil {
		return nil, err
	}
	return &newPermission, nil
}

func (s *permissionService) GetPermissionByUser(user string) ([]Permission, error) {
	permissions, err := s.repo.GetByUser(user)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, err
	}

	return permissions, nil
}

func (s *permissionService) GetPermissionBySection(section string) ([]Permission, error) {
	permissions, err := s.repo.GetBySection(section)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, err
	}

	return permissions, nil
}

func (s *permissionService) DeletePermissionByUserSection(user string, section string) error {
	err := s.repo.DeleteByUserSection(user, section)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPermissionNotFound
		}
		return err
	}

	return nil
}

func (s *permissionService) UpdatePermissionByUserSection(user string, section string, request PermissionRequest) error {
	updatePermission := Permission{
		UserEmail:      request.UserEmail,
		SectionName:    request.SectionName,
		PermissionType: request.PermissionType,
	}

	err := s.repo.UpdateByUserSection(user, section, &updatePermission)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPermissionNotFound
		}
		return err
	}

	return nil
}

func (s *permissionService) GetPermissions(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*PermissionListResult, error) {
	if page < 1 {
		return nil, fmt.Errorf("page must be greater than 0")
	}

	if limit < 1 {
		return nil, fmt.Errorf("limit must be greater than 0")
	}

	if sortBy == "" {
		sortBy = "event_init_date"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"user_email":      true,
		"section_name":    true,
		"permission_type": true,
	}

	if !allowedSortFields[sortBy] {
		return nil, fmt.Errorf("invalid sort_by parameter")
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, fmt.Errorf("invalid sort_order parameter")
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, fmt.Errorf("search_by and search_value must be provided together")
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"user_email":      true,
			"section_name":    true,
			"permission_type": true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("invalid search_by parameter")
		}
	}

	offset := (page - 1) * limit
	query := PermissionListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetPermissions(query)
}
