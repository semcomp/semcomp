package presence

import (
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"
	"backend/internal/event"
	"backend/internal/signinEvent"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
)

type PresenceService interface {
	SetRateRecalculator(recalculator RateRecalculator)
	CreatePresence(request CreatePresenceRequest) (*Presence, error)
	GetPresenceByUserEventandInitDate(userNumber string, eventName string, initDate string) (*Presence, error)
	DeletePresenceByUserEventandInitDate(userNumber string, eventName string, initDate string) error
	UpdatePresenceByUserEventandInitDate(userNumber string, eventName string, initDate string, request UpdatePresenceRequest) error
	GetPresences(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*PresenceListResult, error)
}

// RateRecalculator dispara o recálculo das taxas de presença após mutações.
type RateRecalculator interface {
	RecalculateUsers(userNumbers ...int64) error
}

type presenceService struct {
	repo            PresenceRepository
	eventRepo       event.EventRepository
	signinEventRepo signinEvent.SigninEventRepository
	recalculator    RateRecalculator
}

func NewPresenceService(repo PresenceRepository, eventRepo event.EventRepository, signinEventRepo signinEvent.SigninEventRepository) PresenceService {
	return &presenceService{repo: repo, eventRepo: eventRepo, signinEventRepo: signinEventRepo}
}

func (s *presenceService) SetRateRecalculator(recalculator RateRecalculator) {
	s.recalculator = recalculator
}

// presenceTimezone é o fuso em que o admin lê os horários no credenciamento. O
// banco roda em UTC, então o "quando" precisa ser convertido na saída — uma
// presença das 21h em São Paulo viraria 00h do dia seguinte se exibida em UTC.
const presenceTimezone = "America/Sao_Paulo"

// formatPresenceTimestamp formata o instante do registro para exibição, no fuso
// do evento. Cai para UTC se o tzdata não estiver disponível no ambiente.
func formatPresenceTimestamp(t time.Time) string {
	loc, err := time.LoadLocation(presenceTimezone)
	if err != nil {
		return t.UTC().Format("02/01/2006 15:04")
	}
	return t.In(loc).Format("02/01/2006 15:04")
}

// duplicatePresenceError monta o conflito informativo com quando e por quem a
// presença foi registrada antes. Usado nas duas vias de duplicata (pré-checagem
// e corrida de insert), para a mensagem ser idêntica nas duas.
func duplicatePresenceError(existing *Presence) error {
	return apierrors.ConflictError(
		fmt.Sprintf("Presença já registrada em %s por %s",
			formatPresenceTimestamp(existing.CreatedAt), existing.EmailAdmin),
		nil,
	)
}

func (s *presenceService) recalcUsers(userNumbers ...int64) {
	if s.recalculator == nil || len(userNumbers) == 0 {
		return
	}
	if err := s.recalculator.RecalculateUsers(userNumbers...); err != nil {
		log.Printf("[presence] erro ao recalcular taxa de presença: %v", err)
	}
}

func (s *presenceService) CreatePresence(request CreatePresenceRequest) (*Presence, error) {
	str := strconv.Itoa(int(request.UserNumber))
	existing, err := s.GetPresenceByUserEventandInitDate(str, request.EventName, request.EventInitDate.Format(time.RFC3339))
	if err == nil {
		return nil, duplicatePresenceError(existing)
	}

	// Verifica se o evento exige inscrição prévia
	eventRecord, err := s.eventRepo.GetByNameAndInitTime(request.EventName, request.EventInitDate)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Evento não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar evento", err)
	}

	if eventRecord.HasSignin {
		signin, err := s.signinEventRepo.GetByUserEventAndInitDate(
			uint(request.UserNumber),
			request.EventName,
			request.EventInitDate,
		)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, apierrors.ForbiddenError("Usuário não está inscrito neste evento", nil)
			}
			return nil, apierrors.InternalServerError("Erro ao verificar inscrição do usuário", err)
		}
		if signin.Status != signinEvent.StatusRegistered {
			return nil, apierrors.ForbiddenError("Usuário não possui inscrição confirmada neste evento", nil)
		}
	}

	newPresence := Presence{
		UserNumber:    request.UserNumber,
		EventName:     request.EventName,
		EventInitDate: request.EventInitDate,
		EmailAdmin:    request.EmailAdmin,
	}

	err = s.repo.Create(&newPresence)
	if err != nil {
		// Corrida entre dois scans do mesmo participante: o SELECT acima não
		// achou nada, mas a PK composta (user_number, event_name,
		// event_init_date) é UNIQUE e o Postgres barra este insert com 23505.
		// O perdedor da corrida merece o mesmo conflito informativo do caminho
		// acima, não um 500 genérico.
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			if winner, gerr := s.GetPresenceByUserEventandInitDate(str, request.EventName, request.EventInitDate.Format(time.RFC3339)); gerr == nil {
				return nil, duplicatePresenceError(winner)
			}
		}
		return nil, apierrors.InternalServerError("Erro ao criar presença", err)
	}

	s.recalcUsers(newPresence.UserNumber)

	return &newPresence, nil
}

func (s *presenceService) GetPresenceByUserEventandInitDate(userNumber string, eventName string, initDate string) (*Presence, error) {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return nil, apierrors.ValidationError("Data do evento inválida", err)
	}

	num, err := strconv.ParseInt(userNumber, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("Número do usuário inválido", err)
	}

	presence, err := s.repo.GetByUserEventandInitDate(num, eventName, initDateParsed)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Presença não encontrada", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar presença", err)
	}

	return presence, nil

}

func (s *presenceService) DeletePresenceByUserEventandInitDate(userNumber string, eventName string, initDate string) error {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return apierrors.ValidationError("Data do evento inválida", err)
	}

	num, err := strconv.ParseInt(userNumber, 10, 64)
	if err != nil {
		return apierrors.ValidationError("Número do usuário inválido", err)
	}

	err = s.repo.DeleteByUserEventandInitDate(num, eventName, initDateParsed)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Presença não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao deletar presença", err)
	}

	s.recalcUsers(num)

	return nil
}

func (s *presenceService) UpdatePresenceByUserEventandInitDate(userNumber string, eventName string, initDate string, request UpdatePresenceRequest) error {
	initDateParsed, err := time.Parse(time.RFC3339, initDate)
	if err != nil {
		return apierrors.ValidationError("Data do evento inválida", err)
	}

	num, err := strconv.ParseInt(userNumber, 10, 64)
	if err != nil {
		return apierrors.ValidationError("Número do usuário inválido", err)
	}

	updatePresence := Presence{
		UserNumber:    request.UserNumber,
		EventName:     request.EventName,
		EventInitDate: initDateParsed,
		EmailAdmin:    request.EmailAdmin,
	}

	err = s.repo.UpdateByUserEventandInitDate(num, eventName, initDateParsed, &updatePresence)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Presença não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao atualizar presença", err)
	}

	if num == request.UserNumber {
		s.recalcUsers(num)
	} else {
		s.recalcUsers(num, request.UserNumber)
	}

	return nil
}

func (s *presenceService) GetPresences(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*PresenceListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}

	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
	}

	if sortBy == "" {
		sortBy = "event_init_date"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"user_number":     true,
		"event_name":      true,
		"event_init_date": true,
		"email_admin":     true,
		"created_at":      true,
	}

	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parâmetro 'sort_by' inválido", nil)
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("Parâmetro 'sort_order' inválido", nil)
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("Parâmetro 'search_by' e 'search_value' devem ser fornecidos juntos", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"user_number":     true,
			"event_name":      true,
			"email_admin":     true,
			"event_init_date": true,
			"created_at":      true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parâmetro 'search_by' inválido", nil)
		}

		if searchBy == "event_init_date" {
			parsedDateTime, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, apierrors.ValidationError("Parâmetro 'search_value' inválido para 'event_init_date', use o formato RFC3339", nil)
			}
			searchValue = parsedDateTime.Format(time.RFC3339)
		}

		// created_at: busca por dia (AAAA-MM-DD) ou por instante (RFC3339). O
		// valor é normalizado para AAAA-MM-DD, que é o que o repositório compara.
		if searchBy == "created_at" {
			parsed, err := time.Parse("2006-01-02", searchValue)
			if err != nil {
				parsed, err = time.Parse(time.RFC3339, searchValue)
				if err != nil {
					return nil, apierrors.ValidationError("Parâmetro 'search_value' inválido para 'created_at', use o formato AAAA-MM-DD", nil)
				}
			}
			searchValue = parsed.Format("2006-01-02")
		}
	}

	offset := (page - 1) * limit
	query := PresenceListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetPresences(query)
}
