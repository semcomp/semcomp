package mailer

type Message struct {
	To      string
	Subject string
	Body    string
}

type SMTPConfig struct {
	Host     string
	Port     int
	Username string
	Password string
}

type Config struct {
	SMTP    SMTPConfig
	BaseURL string
}
