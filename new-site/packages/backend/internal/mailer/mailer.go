package mailer

import (
	"context"
	"fmt"
)

type Mailer struct {
	sender  Sender
	baseURL string
}

func NewMailer(config Config) *Mailer {
	return &Mailer{
		sender:  &smtpSender{config: config.SMTP},
		baseURL: config.BaseURL,
	}
}

func (m *Mailer) SendVerificationEmail(name, email, token string) {
	link := fmt.Sprintf("%s/api/verify-email?token=%s", m.baseURL, token)
	msg := Message{
		To:      email,
		Subject: "Verifique seu e-mail - SEMCOMP",
		Body:    fmt.Sprintf("Olá %s,\n\nVerifique seu e-mail clicando no link abaixo:\n%s\n\nEste link expira em 24 horas.", name, link),
	}
	go m.sender.Send(context.Background(), msg)
}

func (m *Mailer) SendPasswordResetEmail(name, email, token string) {
	link := fmt.Sprintf("%s/reset-password?token=%s", m.baseURL, token)
	msg := Message{
		To:      email,
		Subject: "Recuperação de Senha - SEMCOMP",
		Body:    fmt.Sprintf("Olá %s,\n\nVocê solicitou a recuperação de senha. Clique no link abaixo para redefini-la:\n%s\n\nEste link expira em 30 minutos.", name, link),
	}
	go m.sender.Send(context.Background(), msg)
}

func (m *Mailer) SendRegistrationConfirmationEmail(name, email, eventName string) {
	msg := Message{
		To:      email,
		Subject: "Inscrição confirmada - SEMCOMP",
		Body: fmt.Sprintf(
			"Olá %s,\n\nSua inscrição no evento \"%s\" foi confirmada!\n\nComo sua vaga foi garantida pelo processo de rodar a fila, a doação passa a ser opcional. Basta comparecer ao Auditório Fernão para confirmar sua presença.\n\nNos vemos lá!",
			name, eventName,
		),
	}
	go m.sender.Send(context.Background(), msg)
}
