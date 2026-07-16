package section

import (
	"errors"
	"fmt"
	"strings"

	"backend/internal/apierrors"

	"gorm.io/gorm"
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
		{"Produtos", "Gerencie os produtos da Semcomp."},
	}
}

func (s *sectionService) InitializeSections() error {
	sections := GetInitialSections()

	// Verifica se cada seção está cadastrada antes de tentar inserir novamente
	for i := range sections {
		_, err := s.repo.GetByName(sections[i].Name)
		if err == nil {
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("erro ao buscar seção %q durante a inicialização: %w", sections[i].Name, err)
		}

		_, err = s.CreateSection(sections[i])
		if err != nil {
			return fmt.Errorf("erro ao criar seção %q durante a inicialização: %w", sections[i].Name, err)
		}
	}

	return nil
}

func (s *sectionService) CreateSection(request CreateSectionRequest) (*Section, error) {
	_, err := s.GetSectionByName(request.Name)
	if err == nil {
		return nil, apierrors.ConflictError("Seção já cadastrada", err)
	}
	
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
