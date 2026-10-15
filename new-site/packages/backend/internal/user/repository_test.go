package user

import (
	"testing"
)

// Testa se a função aceita os campos de ordenação usados pela tabela de usuários do backoffice,
// nas ordens ascendente e descendente
func TestResolveSortClause_Valid(t *testing.T) {
	tests := []struct {
		name      string
		sortBy    string
		sortOrder string
		expected  string
	}{
		{"name asc", "name", "asc", "name asc"},
		{"has_papfe asc", "has_papfe", "asc", "has_papfe asc"},
		{"has_papfe desc", "has_papfe", "desc", "has_papfe desc"},
		{"quer_cracha asc", "quer_cracha", "asc", "quer_cracha asc"},
		{"quer_cracha desc", "quer_cracha", "desc", "quer_cracha desc"},
		{"autoriza_compartilhamento asc", "autoriza_compartilhamento", "asc", "autoriza_compartilhamento asc"},
		{"autoriza_compartilhamento desc", "autoriza_compartilhamento", "desc", "autoriza_compartilhamento desc"},
		{"disabilities asc", "disabilities", "asc", "disabilities asc"},
		{"disabilities desc", "disabilities", "desc", "disabilities desc"},
		// garante normalização para minúsculas antes da comparação
		{"campos em maiúsculo", "QUER_CRACHA", "DESC", "quer_cracha desc"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := resolveSortClause(tt.sortBy, tt.sortOrder)
			if err != nil {
				t.Errorf("erro não esperado: %v", err)
			}
			if result != tt.expected {
				t.Errorf("esperado %q, obtido %q", tt.expected, result)
			}
		})
	}
}

// Testa se campos em camelCase (como enviados antes pelo frontend) continuam sendo rejeitados
func TestResolveSortClause_InvalidField(t *testing.T) {
	_, err := resolveSortClause("hasPapfe", "asc")
	if err == nil {
		t.Error("esperado erro para campo inválido, mas não ocorreu")
	}
}

// Testa se a função retorna erro para uma ordem inválida
func TestResolveSortClause_InvalidOrder(t *testing.T) {
	_, err := resolveSortClause("quer_cracha", "invalid")
	if err == nil {
		t.Error("esperado erro para ordem inválida, mas não ocorreu")
	}
}
