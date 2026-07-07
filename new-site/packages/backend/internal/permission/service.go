package permission

import (
	"errors"
	"fmt"
	"os"
	"slices"
	"strings"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

var (
	ErrPermissionNotFound = errors.New("permission not found")
)

type PermissionService interface {
	InitializePermissions() error
	CreatePermission(request PermissionRequest) (*Permission, error)
	GetPermissionByUser(user string) ([]Permission, error)
	GetPermissionBySection(section string) ([]Permission, error)
	DeletePermissionByUserSection(user string, section string) error
	UpdatePermissionByUserSection(user string, section string, request PermissionRequest) error
	GetPermissions(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*PermissionListResult, error)
	GetKnownSections() []string
}

type permissionService struct {
	repo PermissionRepository
}

func NewPermissionService(repo PermissionRepository) PermissionService {
	return &permissionService{repo: repo}
}

func GetInitialPermissions(email string) []PermissionRequest {
	return []PermissionRequest{
		{email, "Seções", "RW"},
		{email, "Eventos", "RW"},
		{email, "Usuários Backoffice", "RW"},
		{email, "Usuários Semcomp", "RW"},
		{email, "Participações", "RW"},
		{email, "Permissões", "RW"},
	}
}

func (s *permissionService) InitializePermissions() error {
	email := os.Getenv("ADMIN_EMAIL")
	if email == "" {
		return errors.New("erro na inicialização do backoffice")
	}

	permissions := GetInitialPermissions(email)
	curPermissions, err := s.GetPermissionByUser(email)
	if err != nil {
		if errors.Is(err, ErrPermissionNotFound) || errors.Is(err, gorm.ErrRecordNotFound) {
			curPermissions = []Permission{}
		} else {
			return errors.New("erro na inicialização das permissões")
		}
	}

	// Verifica se cada permissão já está cadastrada antes de cadastrar novamente
	for i := range permissions {
		if !slices.ContainsFunc(curPermissions, func(p Permission) bool {
			return p.UserEmail == permissions[i].UserEmail && p.SectionName == permissions[i].SectionName
		}) {
			_, err := s.CreatePermission(permissions[i])
			if err != nil {
				return errors.New("erro na inicialização das permissões")
			}
		}
	}

	return nil
}

func (s *permissionService) GetKnownSections() []string {
	return KnownSections
}

func (s *permissionService) CreatePermission(request PermissionRequest) (*Permission, error) {
	if !slices.Contains(KnownSections, request.SectionName) {
		return nil, apierrors.ValidationError("Seção inexistente", nil)
	}

	_, err := s.GetPermissionByUserSection(request.UserEmail, request.SectionName)
	if err == nil {
		return nil, apierrors.ConflictError("Permissão já cadastrada", err)
	}

	newPermission := Permission{
		UserEmail:      request.UserEmail,
		SectionName:    request.SectionName,
		PermissionType: request.PermissionType,
	}

	err = s.repo.Create(&newPermission)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar permissão", err)
	}
	return &newPermission, nil
}

func (s *permissionService) GetPermissionByUser(user string) ([]Permission, error) {
	permissions, err := s.repo.GetByUser(user)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return permissions, apierrors.NotFoundError("Permissões não encontradas para esse usuário", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar permissão do usuário", err)
	}

	return permissions, nil
}

func (s *permissionService) GetPermissionBySection(section string) ([]Permission, error) {
	permissions, err := s.repo.GetBySection(section)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return permissions, apierrors.NotFoundError("Não há usuários com essas permissões cadastradas", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar usuários com essa permissão", err)
	}

	return permissions, nil
}

func (s *permissionService) GetPermissionByUserSection(user string, section string) (*Permission, error) {
	permissions, err := s.repo.GetByUserSection(user, section)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Permissão não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao encontrar permissão", err)
	}

	return permissions, nil
}

func (s *permissionService) DeletePermissionByUserSection(user string, section string) error {
	err := s.repo.DeleteByUserSection(user, section)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Permissão não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao deletar permissão", err)
	}

	return nil
}

func (s *permissionService) UpdatePermissionByUserSection(user string, section string, request PermissionRequest) error {
	if !slices.Contains(KnownSections, request.SectionName) {
		return apierrors.ValidationError("Seção inexistente", nil)
	}

	updatePermission := Permission{
		UserEmail:      request.UserEmail,
		SectionName:    request.SectionName,
		PermissionType: request.PermissionType,
	}

	err := s.repo.UpdateByUserSection(user, section, &updatePermission)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Permissão não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao atualizar permissão", err)
	}

	return nil
}

func (s *permissionService) GetPermissions(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*PermissionListResult, error) {
	if page < 1 {
		return nil, fmt.Errorf("valor de 'page' deve ser maior que 0")
	}

	if limit < 1 {
		return nil, fmt.Errorf("valor de 'limit' deve ser maior que 0")
	}

	if sortBy == "" {
		sortBy = "user_email"
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
		return nil, fmt.Errorf("parâmetro 'sort_by' inválido")
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, fmt.Errorf("parâmetro 'sort_order' inválido")
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, fmt.Errorf("'search_by' e 'search_value' devem ser enviados juntos")
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"user_email":      true,
			"section_name":    true,
			"permission_type": true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("parâmetro 'search_by' inválido")
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
