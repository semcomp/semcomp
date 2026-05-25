package section

import (
	"errors"
	"strings"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

var (
	ErrSectionNotFound = errors.New("section not found")
)

type SectionService interface {
	CreateSection(request CreateSectionRequest) (*Section, error)
	GetSectionByName(name string) (*Section, error)
	DeleteSectionByName(name string) error
	UpdateSectionByName(name string, request UpdateSectionRequest) (*Section, error)
	GetSections(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SectionListResult, error)
}

type sectionService struct {
	repo SectionRepository
}

func NewSectionService(repo SectionRepository) SectionService {
	return &sectionService{repo: repo}
}

func (s *sectionService) CreateSection(request CreateSectionRequest) (*Section, error) {
	newSection := Section{
		Name:        request.Name,
		Description: request.Description,
	}
	if err := s.repo.Create(&newSection); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar seção", err)
	}
	return &newSection, nil
}

func (s *sectionService) GetSectionByName(name string) (*Section, error) {
	section, err := s.repo.GetByName(name)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Seção não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar seção", err)
	}
	return section, nil
}

func (s *sectionService) DeleteSectionByName(name string) error {
	err := s.repo.DeleteByName(name)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Seção não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao deletar seção", err)
	}
	return nil
}

func (s *sectionService) UpdateSectionByName(name string, request UpdateSectionRequest) (*Section, error) {
	section := Section{
		Name:        request.Name,
		Description: request.Description,
	}
	err := s.repo.UpdateByName(name, &section)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Seção não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar seção", err)
	}
	return &section, nil
}

func (s *sectionService) GetSections(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SectionListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}
	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
	}

	if sortBy == "" {
		sortBy = "name"
	}
	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"name":        true,
		"description": true,
	}
	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parâmetro 'sort_by' inválido", nil)
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("Parâmetro 'sort_order' inválido", nil)
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("Parâmetro 'search_by' e 'search_value' devem ser fornecidos juntos", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)
		allowedSearchFields := map[string]bool{
			"name":        true,
			"description": true,
		}
		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parâmetro 'search_by' inválido", nil)
		}
	}

	offset := (page - 1) * limit
	query := SectionListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetSections(query)
}
