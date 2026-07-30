package providers

import "testing"

// Testa a validação de formato de e-mail com uma tabela de casos válidos e inválidos
func TestEmailValidationProvider_Validate(t *testing.T) {
	provider := NewEmailValidationProvider()

	cases := []struct {
		email   string
		isValid bool
	}{
		{"ana@example.com", true},
		{"ana.silva+tag@example.com.br", true},
		{"", false},
		{"sem-arroba.com", false},
		{"ana@localhost", false},
		{"ana@", false},
		{"@example.com", false},
		{"Nome Sobrenome <ana@example.com>", false},
		{"ana@@example.com", false},
	}

	for _, c := range cases {
		err := provider.Validate(c.email)
		if c.isValid && err != nil {
			t.Errorf("esperado e-mail válido para %q, recebido erro: %v", c.email, err)
		}
		if !c.isValid && err == nil {
			t.Errorf("esperado erro para e-mail inválido %q", c.email)
		}
	}
}
