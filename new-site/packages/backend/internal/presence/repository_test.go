package presence

import (
	"testing"
)

// Testa se a função aceita todas as combinações válidas de campos e ordens, normalizando maiúsculas para minúsculas
func TestResolveSortClause_Valid(t *testing.T) {
	tests := []struct {
		name      string
		sortBy    string
		sortOrder string
		expected  string
	}{
		{"user_number asc", "user_number", "asc", "user_number asc"},
		{"user_number desc", "user_number", "desc", "user_number desc"},
		{"event_name asc", "event_name", "asc", "event_name asc"},
		{"event_name desc", "event_name", "desc", "event_name desc"},
		{"event_init_date asc", "event_init_date", "asc", "event_init_date asc"},
		{"event_init_date desc", "event_init_date", "desc", "event_init_date desc"},
		{"email_admin asc", "email_admin", "asc", "email_admin asc"},
		{"email_admin desc", "email_admin", "desc", "email_admin desc"},
		// garante normalização para minúsculas antes da comparação
		{"campos em maiúsculo", "USER_NUMBER", "ASC", "user_number asc"},
		{"campos em maiúsculo", "EVENT_NAME", "ASC", "event_name asc"},
		{"campos em maiúsculo", "EVENT_INIT_DATE", "ASC", "event_init_date asc"},
		{"campos em maiúsculo", "EMAIL_ADMIN", "ASC", "email_admin asc"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := resolveSortClause(tt.sortBy, tt.sortOrder)
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
func TestResolveSortClause_InvalidField(t *testing.T) {
	_, err := resolveSortClause("invalid", "asc")
	if err == nil {
		t.Error("esperado erro para campo inválido, mas não ocorreu")
	}
}

// Testa se a função rejeita direções de ordenação fora de "asc" e "desc"
func TestResolveSortClause_InvalidOrder(t *testing.T) {
	_, err := resolveSortClause("name", "invalid")
	if err == nil {
		t.Error("esperado erro para ordem inválida, mas não ocorreu")
	}
}

// Testa se um campo vazio é tratado como inválido e resulta em erro
func TestResolveSortClause_EmptyField(t *testing.T) {
	_, err := resolveSortClause("", "asc")
	if err == nil {
		t.Error("esperado erro para campo vazio, mas não ocorreu")
	}
}

// Testa se uma ordem vazia é tratada como inválida e resulta em erro
func TestResolveSortClause_EmptyOrder(t *testing.T) {
	_, err := resolveSortClause("name", "")
	if err == nil {
		t.Error("esperado erro para ordem vazia, mas não ocorreu")
	}
}
