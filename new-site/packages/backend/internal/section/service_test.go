package section

import (
	"reflect"
	"testing"

	"gorm.io/gorm"
)

// MockSectionRepository implementa a interface SectionRepository manualmente
type MockSectionRepository struct {
	CreateFunc       func(section *Section) error
	GetByNameFunc    func(name string) (*Section, error)
	DeleteByNameFunc func(name string) error
	UpdateByNameFunc func(name string, section *Section) error
	GetSectionsFunc  func(query SectionListQuery) (*SectionListResult, error)
}

func (m *MockSectionRepository) Create(section *Section) error {
	return m.CreateFunc(section)
}

func (m *MockSectionRepository) GetByName(name string) (*Section, error) {
	return m.GetByNameFunc(name)
}

func (m *MockSectionRepository) DeleteByName(name string) error {
	return m.DeleteByNameFunc(name)
}

func (m *MockSectionRepository) UpdateByName(name string, section *Section) error {
	return m.UpdateByNameFunc(name, section)
}

func (m *MockSectionRepository) GetSections(query SectionListQuery) (*SectionListResult, error) {
	return m.GetSectionsFunc(query)
}

// Testa se o serviço repassa corretamente os dados da requisição ao repositório e retorna a seção criada sem erros
func TestCreateSection(t *testing.T) {
	mockRepo := &MockSectionRepository{
		CreateFunc: func(section *Section) error {
			// Garante que o nome foi propagado corretamente do request para o modelo
			if section.Name != "Eventos" {
				t.Errorf("esperado nome 'Eventos', recebido '%s'", section.Name)
			}
			return nil
		},
	}
	service := NewSectionService(mockRepo)

	req := CreateSectionRequest{
		Name:        "Eventos",
		Description: "Gerencie os eventos",
	}

	section, err := service.CreateSection(req)

	if err != nil {
		t.Errorf("erro não esperado: %v", err)
	}
	if section == nil || section.Name != "Eventos" {
		t.Errorf("retorno da seção inválido: %v", section)
	}
}

// Testa se o serviço retorna a seção correta quando o repositório a encontra com sucesso
func TestGetSectionByName_Success(t *testing.T) {
	expectedSection := &Section{Name: "Eventos", Description: "Desc"}
	mockRepo := &MockSectionRepository{
		GetByNameFunc: func(name string) (*Section, error) {
			return expectedSection, nil
		},
	}
	service := NewSectionService(mockRepo)

	section, err := service.GetSectionByName("Eventos")

	if err != nil {
		t.Errorf("erro não esperado: %v", err)
	}
	if !reflect.DeepEqual(section, expectedSection) {
		t.Errorf("esperado %v, recebido %v", expectedSection, section)
	}
}

// Testa se o serviço converte gorm.ErrRecordNotFound para o erro de domínio ErrSectionNotFound, evitando vazar detalhes do ORM
func TestGetSectionByName_NotFound(t *testing.T) {
	mockRepo := &MockSectionRepository{
		GetByNameFunc: func(name string) (*Section, error) {
			return nil, gorm.ErrRecordNotFound
		},
	}
	service := NewSectionService(mockRepo)

	section, err := service.GetSectionByName("Inexistente")

	if err != ErrSectionNotFound {
		t.Errorf("esperado erro %v, recebido %v", ErrSectionNotFound, err)
	}
	if section != nil {
		t.Errorf("esperado seção nil, recebido %v", section)
	}
}

// Testa se o serviço deleta uma seção sem retornar erros quando o repositório confirma a remoção
func TestDeleteSectionByName_Success(t *testing.T) {
	mockRepo := &MockSectionRepository{
		DeleteByNameFunc: func(name string) error {
			return nil
		},
	}
	service := NewSectionService(mockRepo)

	err := service.DeleteSectionByName("Eventos")

	if err != nil {
		t.Errorf("erro não esperado: %v", err)
	}
}

// Testa se o serviço atualiza a seção com os dados do request e retorna o modelo atualizado
func TestUpdateSectionByName_Success(t *testing.T) {
	mockRepo := &MockSectionRepository{
		UpdateByNameFunc: func(name string, section *Section) error {
			// Confirma que o nome atualizado foi propagado corretamente
			if section.Name != "Atualizado" {
				t.Errorf("esperado nome 'Atualizado', recebido '%s'", section.Name)
			}
			return nil
		},
	}
	service := NewSectionService(mockRepo)

	req := UpdateSectionRequest{Name: "Atualizado", Description: "Nova desc"}
	section, err := service.UpdateSectionByName("Eventos", req)

	if err != nil {
		t.Errorf("erro não esperado: %v", err)
	}
	if section == nil || section.Name != "Atualizado" {
		t.Errorf("retorno da seção inválido: %v", section)
	}
}

// Testa se o serviço rejeita combinações inválidas de parâmetros de paginação, ordenação e busca, retornando mensagens de erro antes de chamar o repositório
func TestGetSections_ValidationErrors(t *testing.T) {
	// O repositório não deve ser chamado em nenhum desses casos
	service := NewSectionService(&MockSectionRepository{})

	tests := []struct {
		name        string
		page        int
		limit       int
		sortBy      string
		sortOrder   string
		searchBy    string
		searchValue string
		expectedErr string
	}{
		{"Page menor que 1", 0, 10, "name", "asc", "", "", "page must be greater than 0"},
		{"Limit menor que 1", 1, 0, "name", "asc", "", "", "limit must be greater than 0"},
		{"SortBy invalido", 1, 10, "invalid", "asc", "", "", "invalid sort_by parameter"},
		{"SortOrder invalido", 1, 10, "name", "invalid", "", "", "invalid sort_order parameter"},
		{"SearchBy sem SearchValue", 1, 10, "name", "asc", "name", "", "search_by and search_value must be provided together"},
		{"SearchBy invalido", 1, 10, "name", "asc", "invalid", "valor", "invalid search_by parameter"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := service.GetSections(tt.page, tt.limit, tt.sortBy, tt.sortOrder, tt.searchBy, tt.searchValue)

			if err == nil || err.Error() != tt.expectedErr {
				t.Errorf("esperado erro '%s', recebido '%v'", tt.expectedErr, err)
			}
			if result != nil {
				t.Errorf("esperado resultado nil, recebido %v", result)
			}
		})
	}
}

// Testa se o serviço calcula o offset corretamente a partir de page/limit e repassa a query ao repositório, retornando o resultado
func TestGetSections_Success(t *testing.T) {
	expectedResult := &SectionListResult{
		Sections:        []Section{{Name: "Eventos", Description: "Desc"}},
		TotalRecords:    1,
		FilteredRecords: 1,
	}

	mockRepo := &MockSectionRepository{
		GetSectionsFunc: func(query SectionListQuery) (*SectionListResult, error) {
			// page=1, limit=10 deve resultar em offset=0
			if query.Limit != 10 || query.Offset != 0 {
				t.Errorf("query incorreta: %v", query)
			}
			return expectedResult, nil
		},
	}
	service := NewSectionService(mockRepo)

	result, err := service.GetSections(1, 10, "name", "asc", "", "")

	if err != nil {
		t.Errorf("erro não esperado: %v", err)
	}
	if !reflect.DeepEqual(result, expectedResult) {
		t.Errorf("esperado %v, recebido %v", expectedResult, result)
	}
}

// Testa se o serviço tenta buscar e (quando não encontra) cria cada seção inicial exatamente uma vez. O número de chamadas esperadas é derivado de GetInitialSections() para que o teste se mantenha correto mesmo que a lista de seções mude
func TestInitializeSections_Success(t *testing.T) {
	getCallCount := 0
	createCallCount := 0

	mockRepo := &MockSectionRepository{
		GetByNameFunc: func(name string) (*Section, error) {
			// Simula que nenhuma seção existe ainda no banco
			getCallCount++
			return nil, gorm.ErrRecordNotFound
		},
		CreateFunc: func(section *Section) error {
			createCallCount++
			return nil
		},
	}
	service := NewSectionService(mockRepo)

	err := service.InitializeSections()

	if err != nil {
		t.Errorf("erro não esperado: %v", err)
	}

	// Valida que Get e Create foram chamados uma vez para cada seção inicial
	initialSectionsCount := len(GetInitialSections())
	if getCallCount != initialSectionsCount {
		t.Errorf("esperado %d chamadas GetByName, recebido %d", initialSectionsCount, getCallCount)
	}
	if createCallCount != initialSectionsCount {
		t.Errorf("esperado %d chamadas Create, recebido %d", initialSectionsCount, createCallCount)
	}
}