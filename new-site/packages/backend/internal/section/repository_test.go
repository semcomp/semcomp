package section

import (
	"testing"
)

// Testa se a função aceita todas as combinações válidas de campos e ordens, normalizando maiúsculas para minúsculas
func TestResolveSectionSortClause_Valid(t *testing.T) {
	tests := []struct {
		name      string
		sortBy    string
		sortOrder string
		expected  string
	}{
		{"name asc", "name", "asc", "name asc"},
		{"name desc", "name", "desc", "name desc"},
		{"description asc", "description", "asc", "description asc"},
		{"description desc", "description", "desc", "description desc"},
		// garante normalização para minúsculas antes da comparação
		{"campos em maiúsculo", "NAME", "ASC", "name asc"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := resolveSectionSortClause(tt.sortBy, tt.sortOrder)
			if err != nil {
				t.Errorf("erro não esperado: %v", err)
			}
			if result != tt.expected {
				t.Errorf("esperado '%s', recebido '%s'", tt.expected, result)
			}
		})
	}
}

// Testa se a função rejeita campos de ordenação fora da lista de permitidos (ex.: "invalid")
func TestResolveSectionSortClause_InvalidField(t *testing.T) {
	_, err := resolveSectionSortClause("invalid", "asc")
	if err == nil {
		t.Error("esperado erro para campo inválido, mas não ocorreu")
	}
}

// Testa se a função rejeita direções de ordenação fora de "asc" e "desc"
func TestResolveSectionSortClause_InvalidOrder(t *testing.T) {
	_, err := resolveSectionSortClause("name", "invalid")
	if err == nil {
		t.Error("esperado erro para ordem inválida, mas não ocorreu")
	}
}

// Testa se um campo vazio é tratado como inválido e resulta em erro
func TestResolveSectionSortClause_EmptyField(t *testing.T) {
	_, err := resolveSectionSortClause("", "asc")
	if err == nil {
		t.Error("esperado erro para campo vazio, mas não ocorreu")
	}
}

// Testa se uma ordem vazia é tratada como inválida e resulta em erro
func TestResolveSectionSortClause_EmptyOrder(t *testing.T) {
	_, err := resolveSectionSortClause("name", "")
	if err == nil {
		t.Error("esperado erro para ordem vazia, mas não ocorreu")
	}
}
