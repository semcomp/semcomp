package providers

import (
	"errors"
	"net/mail"
	"strings"
)

type EmailValidationProvider interface {
	Validate(email string) error
}

var (
	ErrInvalidEmailFormat = errors.New("Formato de e-mail inválido")
)

type emailValidationProvider struct{}

func NewEmailValidationProvider() EmailValidationProvider {
	return &emailValidationProvider{}
}

// Validate aplica uma checagem RFC 5322 (via net/mail) mais estrita que a tag
// "email" do validator: rejeita formatos com nome de exibição (ex: "Nome <a@b.com>")
// e domínios sem um ponto (ex: "user@localhost").
func (p *emailValidationProvider) Validate(email string) error {
	addr, err := mail.ParseAddress(email)
	if err != nil {
		return ErrInvalidEmailFormat
	}

	if addr.Address != email {
		return ErrInvalidEmailFormat
	}

	atIndex := strings.LastIndex(email, "@")
	if atIndex == -1 || atIndex == len(email)-1 {
		return ErrInvalidEmailFormat
	}

	domain := email[atIndex+1:]
	if !strings.Contains(domain, ".") {
		return ErrInvalidEmailFormat
	}

	return nil
}
