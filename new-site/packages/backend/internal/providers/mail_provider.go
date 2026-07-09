package providers

import (
	"errors"
	"fmt"
	"net/smtp"
	"os"
)

type MailProvider interface {
	SendVerificationEmail(to string, name string, rawToken string) error
}

var (
	ErrSMTPHostNotConfigured    = errors.New("Variável de ambiente SMTP_HOST não configurada")
	ErrSMTPFromNotConfigured    = errors.New("Variável de ambiente SMTP_FROM não configurada")
	ErrFrontendURLNotConfigured = errors.New("Variável de ambiente FRONTEND_URL não configurada")
)

type smtpMailProvider struct{}

func NewMailProvider() MailProvider {
	return &smtpMailProvider{}
}

func (p *smtpMailProvider) SendVerificationEmail(to string, name string, rawToken string) error {
	host := os.Getenv("SMTP_HOST")
	if host == "" {
		return ErrSMTPHostNotConfigured
	}

	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}

	from := os.Getenv("SMTP_FROM")
	if from == "" {
		return ErrSMTPFromNotConfigured
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		return ErrFrontendURLNotConfigured
	}

	user := os.Getenv("SMTP_USER")
	password := os.Getenv("SMTP_PASSWORD")

	verificationLink := fmt.Sprintf("%s/verify-email?token=%s", frontendURL, rawToken)
	subject := "Confirme seu e-mail - Semcomp"
	body := fmt.Sprintf(`<html>
<body style="font-family: sans-serif;">
	<p>Olá, %s!</p>
	<p>Obrigado por se cadastrar na Semcomp. Confirme seu e-mail clicando no link abaixo:</p>
	<p><a href="%s">Confirmar e-mail</a></p>
	<p>Se você não criou esta conta, ignore esta mensagem.</p>
</body>
</html>`, name, verificationLink)

	message := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		from, to, subject, body,
	)

	addr := fmt.Sprintf("%s:%s", host, port)

	var auth smtp.Auth
	if user != "" {
		auth = smtp.PlainAuth("", user, password, host)
	}

	return smtp.SendMail(addr, auth, from, []string{to}, []byte(message))
}
