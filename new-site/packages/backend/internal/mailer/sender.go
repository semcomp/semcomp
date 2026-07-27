package mailer

import (
	"context"

	gomail "gopkg.in/gomail.v2"
)

type Sender interface {
	Send(ctx context.Context, msg Message) error
}

type smtpSender struct {
	config SMTPConfig
}

func (s *smtpSender) Send(ctx context.Context, msg Message) error {
	m := gomail.NewMessage()
	m.SetHeader("From", s.config.Username)
	m.SetHeader("To", msg.To)
	m.SetHeader("Subject", msg.Subject)
	m.SetBody("text/plain", msg.Body)

	d := gomail.NewDialer(s.config.Host, s.config.Port, s.config.Username, s.config.Password)
	return d.DialAndSend(m)
}
