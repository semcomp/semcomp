package user

import (
	"errors"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"
	"backend/internal/mailer"
	"backend/internal/providers"
	"backend/internal/token"
)

var (
	ErrEmailAlreadyExists  = errors.New("email já cadastrado")
	ErrInvalidCredentials  = errors.New("email e/ou senha inválido(s)")
	ErrTokenGeneration     = errors.New("geração do token falhou")
	ErrInternalServerError = errors.New("erro interno")
)


// UserService define as regras de negócio para operações relacionadas a usuários.
type UserService interface {
	CreateUser(request CreateUserRequest) (*SafeUser, error)
	GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserListResult, error)
	GetUserByID(id uint) (*SafeUser, error)
	UpdateUser(id uint, request UpdateUserRequest) error
	DeleteUser(id uint) error
	VerifyEmail(rawToken string) error
	ResendVerification(email string) error
	RequestPasswordReset(email string) error
	ResetPassword(tokenPlain string, newPassword string) error
}

// userService é a implementação concreta de UserService.
type userService struct {
	repo                    UserRepository
	papfeRepo               PapfeDocumentRepository
	passwordProvider        providers.PasswordProvider
	tokenProvider           providers.TokenProvider
	mailProvider            providers.MailProvider
	emailValidationProvider providers.EmailValidationProvider
	tokenRepo               token.Repository
	mailer                  *mailer.Mailer
}

// NewUserService inicializa e retorna uma nova instância de UserService.
func NewUserService(
	repo UserRepository,
	papfeRepo PapfeDocumentRepository,
	passwordProvider providers.PasswordProvider,
	tokenProvider providers.TokenProvider,
	mailProvider providers.MailProvider,
	emailValidationProvider providers.EmailValidationProvider,
	tokenRepo token.Repository,
	mailer *mailer.Mailer,
) UserService {
	return &userService{
		repo:                    repo,
		papfeRepo:               papfeRepo,
		passwordProvider:        passwordProvider,
		tokenProvider:           tokenProvider,
		mailProvider:            mailProvider,
		emailValidationProvider: emailValidationProvider,
		tokenRepo:               tokenRepo,
		mailer:                  mailer,
	}
}

// CreateUser valida duplicatas, criptografa a senha e salva o novo usuário, disparando
// o e-mail de confirmação. Se o e-mail já existir mas ainda não tiver sido confirmado,
// reenvia um novo link para a conta existente em vez de criar um duplicado (sem
// sobrescrever nome/senha, para não permitir que outra pessoa assuma a conta pendente).
func (s *userService) CreateUser(request CreateUserRequest) (*SafeUser, error) {
	if err := s.emailValidationProvider.Validate(request.Email); err != nil {
		return nil, apierrors.ValidationError("E-mail inválido", err)
	}

	existingUser, err := s.repo.GetByEmail(request.Email)
	if err == nil {
		if existingUser.EmailVerified {
			return nil, apierrors.ConflictError("Email já cadastrado", nil)
		}

		s.regenerateAndSendVerification(existingUser)
		safe := ToSafeUser(existingUser)
		return &safe, nil
	}

	hashedPassword, err := s.passwordProvider.Hash(request.Password)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao processar a senha", err)
	}

	newUser := User{
		Name:          request.Name,
		Email:         request.Email,
		PasswordHash:  hashedPassword,
		Age:           request.Age,
		Gender:        request.Gender,
		City:          request.City,
		Education:     request.Education,
		HasPapfe:      request.HasPapfe,
		Disabilities:  request.Disabilities,
		Profession:    request.Profession,
		Linkedin:      request.Linkedin,
		Telegram:      request.Telegram,
		PresenceRate:  0.0,
		EmailVerified: false,
	}

	if err := s.repo.Create(&newUser); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar usuário", err)
	}

	if request.PapfeFilename != "" {
		doc := &PapfeDocument{
			UserEmail:   newUser.Email,
			Filename:    request.PapfeFilename,
			ContentType: request.PapfeContentType,
			Data:        request.PapfeData,
			UploadedAt:  time.Now(),
		}
		if err := s.papfeRepo.Upsert(doc); err != nil {
			log.Printf("[papfe] falha ao salvar comprovante para %s: %v", newUser.Email, err)
		}
	}

	s.regenerateAndSendVerification(&newUser)

	safe := ToSafeUser(&newUser)
	return &safe, nil
}

// VerifyEmail confirma o e-mail de um usuário a partir do token bruto recebido pelo link.
// É idempotente: verificar um token de uma conta já confirmada retorna sucesso.
func (s *userService) VerifyEmail(rawToken string) error {
	hash := s.tokenProvider.Hash(rawToken)

	u, err := s.repo.GetByVerificationTokenHash(hash)
	if err != nil {
		return apierrors.NotFoundError("Link de verificação inválido ou expirado", err)
	}

	if u.EmailVerified {
		return nil
	}

	if u.VerificationTokenExpiresAt == nil || time.Now().After(*u.VerificationTokenExpiresAt) {
		return apierrors.NotFoundError("Link de verificação inválido ou expirado", nil)
	}

	u.EmailVerified = true
	if err := s.repo.Update(u); err != nil {
		return apierrors.InternalServerError("Erro ao confirmar e-mail", err)
	}

	return nil
}

// ResendVerification reenvia o link de confirmação para o e-mail informado. Sempre
// retorna sucesso (nil), independente de o e-mail existir, já estar verificado ou ter
// atingido o cooldown/limite diário de reenvios — evita vazar quais e-mails estão
// cadastrados no sistema.
func (s *userService) ResendVerification(email string) error {
	if err := s.emailValidationProvider.Validate(email); err != nil {
		return nil
	}

	existingUser, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil
	}

	if existingUser.EmailVerified {
		return nil
	}

	s.regenerateAndSendVerification(existingUser)
	return nil
}

// regenerateAndSendVerification gera um novo token de verificação, aplica cooldown e
// limite diário de reenvios, persiste os campos e dispara o e-mail. Falhas de geração,
// persistência ou envio são silenciosamente ignoradas (best-effort) — o usuário sempre
// pode solicitar um novo reenvio depois.
func (s *userService) regenerateAndSendVerification(u *User) {
	now := time.Now()

	if u.VerificationSentAt != nil && now.Sub(*u.VerificationSentAt) < verificationResendCooldown() {
		remaining := verificationResendCooldown() - now.Sub(*u.VerificationSentAt)
		log.Printf("[email] cooldown ativo para %s — tente novamente em %.0fs", u.Email, remaining.Seconds())
		return
	}

	windowStart := u.VerificationWindowStartAt
	sendCount := u.VerificationSendCount
	if windowStart == nil || now.Sub(*windowStart) > 24*time.Hour {
		windowStart = &now
		sendCount = 0
	}

	if sendCount >= verificationMaxResendsPerDay() {
		log.Printf("[email] limite diário de reenvios atingido para %s (%d/%d)", u.Email, sendCount, verificationMaxResendsPerDay())
		return
	}

	raw, hash, err := s.tokenProvider.Generate()
	if err != nil {
		return
	}

	expiresAt := now.Add(verificationTokenTTL())

	u.VerificationTokenHash = hash
	u.VerificationTokenExpiresAt = &expiresAt
	u.VerificationSentAt = &now
	u.VerificationWindowStartAt = windowStart
	u.VerificationSendCount = sendCount + 1

	if err := s.repo.Update(u); err != nil {
		return
	}

	if err := s.mailProvider.SendVerificationEmail(u.Email, u.Name, raw); err != nil {
		log.Printf("[email] falha ao enviar verificação para %s: %v", u.Email, err)
	}
}

func verificationTokenTTL() time.Duration {
	hours, err := strconv.Atoi(os.Getenv("EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_HOURS"))
	if err != nil || hours <= 0 {
		hours = 24
	}
	return time.Duration(hours) * time.Hour
}

func verificationResendCooldown() time.Duration {
	seconds, err := strconv.Atoi(os.Getenv("EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS"))
	if err != nil || seconds <= 0 {
		seconds = 60
	}
	return time.Duration(seconds) * time.Second
}

func verificationMaxResendsPerDay() int {
	maxResends, err := strconv.Atoi(os.Getenv("EMAIL_VERIFICATION_MAX_RESENDS_PER_DAY"))
	if err != nil || maxResends <= 0 {
		maxResends = 5
	}
	return maxResends
}

// GetAllUsers recupera todos os usuários repassando a chamada para a camada de repositório.
func (s *userService) GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*UserListResult, error) {

	if page < 1 {
		return nil, apierrors.ValidationError("Valor de 'page' inválido", nil)
	}

	if limit < 1 {
		return nil, apierrors.ValidationError("Valor de 'limit' inválido", nil)
	}

	if sortBy == "" {
		sortBy = "name"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	// Definição dos campos possíveis para ordenação
	allowedSortFields := map[string]bool{
		"user_number":  true,
		"name":         true,
		"email":        true,
		"age":          true,
		"gender":       true,
		"city":         true,
		"education":    true,
		"has_papfe":    true,
		"profession":   true,
		"linkedin":     true,
		"telegram":     true,
	}

	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parâmetro 'sort_by' inválido", nil)
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("Parâmetro 'sort_order' inválido", nil)
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("Para realizar uma busca, envie 'search_by' juntamente com 'search_value' ", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"user_number":  true,
			"name":         true,
			"email":        true,
			"age":          true,
			"gender":       true,
			"city":         true,
			"education":    true,
			"has_papfe":    true,
			"disabilities": true,
			"profession":   true,
			"linkedin":     true,
			"telegram":     true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parâmetro 'search_by' inválido", nil)
		}

		if searchBy == "age" {
			if _, err := strconv.Atoi(searchValue); err != nil {
				return nil, apierrors.ValidationError("Valor inválido para busca por 'age' ", nil)
			}
		}

		if searchBy == "user_number" {
			if _, err := strconv.Atoi(searchValue); err != nil {
				return nil, apierrors.ValidationError("Valor inválido para busca por 'user_number' ", nil)
			}
		}

		if searchBy == "has_papfe" {
			if _, err := strconv.ParseBool(searchValue); err != nil {
				return nil, apierrors.ValidationError("Valor inválido para busca por 'has_papfe' ", nil)
			}
		}
	}

	offset := (page - 1) * limit

	query := UserListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	users, err := s.repo.GetAll(query)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao recuperar usuários", err)
	}

	return users, nil
}

// GetUserByID busca e retorna um usuário específico pelo seu ID.
func (s *userService) GetUserByID(id uint) (*SafeUser, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar usuário", err)
	}

	safe := ToSafeUser(user)
	return &safe, nil
}

// UpdateUser aplica regras de negócio de edição e atualiza um usuário existente.
func (s *userService) UpdateUser(id uint, request UpdateUserRequest) error {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return apierrors.InternalServerError("Erro ao buscar usuário", err)
	}

	user.Name = request.Name
	user.Email = request.Email
	user.Age = request.Age
	user.Gender = request.Gender
	user.City = request.City
	user.Education = request.Education
	user.HasPapfe = request.HasPapfe
	user.Disabilities = request.Disabilities
	user.Profession = request.Profession
	user.Linkedin = request.Linkedin
	user.Telegram = request.Telegram

	return s.repo.Update(user)
}

// DeleteUser remove um usuário do sistema a partir do seu ID.
func (s *userService) DeleteUser(id uint) error {
	return s.repo.Delete(id)
}

func (s *userService) RequestPasswordReset(email string) error {
	userRecord, err := s.repo.GetByEmail(email)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			return nil
		}
		return err
	}

	if err := s.tokenRepo.DeleteByUserAndType(userRecord.UserNumber, token.PasswordReset); err != nil {
		return err
	}

	plainToken, hash, err := token.GenerateToken()
	if err != nil {
		return ErrTokenGeneration
	}

	resetToken := token.Token{
		UserID:    userRecord.UserNumber,
		TokenHash: hash,
		Type:      token.PasswordReset,
		ExpiresAt: time.Now().Add(30 * time.Minute),
	}

	if err := s.tokenRepo.Create(&resetToken); err != nil {
		return err
	}

	s.mailer.SendPasswordResetEmail(userRecord.Name, userRecord.Email, plainToken)

	return nil
}

func (s *userService) ResetPassword(tokenPlain string, newPassword string) error {
	hash := token.HashToken(tokenPlain)

	t, err := s.tokenRepo.FindByHash(hash)
	if err != nil {
		return err
	}

	if t.UsedAt != nil {
		return token.ErrTokenUsed
	}

	if time.Now().After(t.ExpiresAt) {
		return token.ErrTokenExpired
	}

	user, err := s.repo.GetByID(t.UserID)
	if err != nil {
		return ErrInternalServerError
	}

	hashedPassword, err := s.passwordProvider.Hash(newPassword)
	if err != nil {
		return errors.New("erro ao processar a senha")
	}

	user.PasswordHash = hashedPassword
	if err := s.repo.Update(user); err != nil {
		return err
	}

	return s.tokenRepo.MarkUsed(t.ID)
}
