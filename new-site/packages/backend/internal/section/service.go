package section

import (
	"errors"
	"fmt"
	"strings"

	"gorm.io/gorm"
)

var (
	ErrSectionNotFound = errors.New("section not found")
)

type SectionService interface {
	InitializeSections() error
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

func GetInitialSections() []CreateSectionRequest {
    return []CreateSectionRequest{
        {"Seções", "Observe as seções dos eventos da Semcomp."},
        {"Eventos", "Gerencie os eventos da Semcomp."},
        {"Usuários Backoffice", "Gerencie os usuários com acesso ao sistema de backoffice."},
        {"Usuários Semcomp", "Gerencie os usuários participantes da Semcomp."},
        {"Participações", "Gerencie as participações dos usuários nos eventos da Semcomp."},
        {"Permissões", "Gerencie as permissões de acesso dos usuários ao sistema."},
    }
}

func (s *sectionService) InitializeSections() error {
	sections := GetInitialSections()

	// Verifica se cada seção está cadastrada antes de tentar inserir novamente
	for i := range sections {
		_, err := s.repo.GetByName(sections[i].Name)
		if err != nil {
			_, err := s.CreateSection(sections[i])
			if err != nil {
				return errors.New("erro na inicialização das seções")
			}	
		}
	}

	return nil
}

func (s *sectionService) CreateSection(request CreateSectionRequest) (*Section, error) {
	newSection := Section{
		Name:        request.Name,
		Description: request.Description,
	}
	if err := s.repo.Create(&newSection); err != nil {
		return nil, err
	}
	return &newSection, nil
}

func (s *sectionService) GetSectionByName(name string) (*Section, error) {
	section, err := s.repo.GetByName(name)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSectionNotFound
		}
		return nil, err
	}
	return section, nil
}

func (s *sectionService) DeleteSectionByName(name string) error {
	err := s.repo.DeleteByName(name)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSectionNotFound
		}
		return err
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
			return nil, ErrSectionNotFound
		}
		return nil, err
	}
	return &section, nil
}

func (s *sectionService) GetSections(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SectionListResult, error) {
	if page < 1 {
		return nil, fmt.Errorf("page must be greater than 0")
	}
	if limit < 1 {
		return nil, fmt.Errorf("limit must be greater than 0")
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
			"name":        true,
			"description": true,
		}
		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("invalid search_by parameter")
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
