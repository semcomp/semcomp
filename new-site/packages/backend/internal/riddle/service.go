package riddle

import (
	"crypto/rand"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"math/big"
	"strings"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type RiddleService interface {
	CreateRiddle(request CreateRiddleRequest) (*Riddle, error)
	GetRiddleByID(id uint) (*Riddle, error)
	UpdateRiddle(id uint, request UpdateRiddleRequest) (*Riddle, error)
	DeleteRiddle(id uint) error
	GetRiddles(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*RiddleListResult, error)
	ReplaceRiddlesFromCSV(file io.Reader) ([]Riddle, error)

	// Jogo do participante (equipes) ---------
	CreateTeam(userNumber uint, request CreateMyTeamRequest) (*TeamView, error)
	JoinTeam(userNumber uint, code string) (*TeamView, error)
	GetMyGame(userNumber uint) (*MyGameResponse, error)
	SolveRiddle(userNumber uint, riddleID uint, answer string) (*SolveResult, error)
}

type riddleService struct {
	repo RiddleRepository
}

func NewRiddleService(repo RiddleRepository) RiddleService {
	return &riddleService{repo: repo}
}

// CreateRiddle sempre acrescenta o riddle no final da fila atual: o
// autoincrement do ID garante isso sozinho, sem nenhuma lógica extra de
// posicionamento.
func (s *riddleService) CreateRiddle(request CreateRiddleRequest) (*Riddle, error) {
	newRiddle := Riddle{
		Hint1:    request.Hint1,
		Hint2:    request.Hint2,
		Answer:   request.Answer,
		ImageURL: request.ImageURL,
		IsActive: true,
	}

	if err := s.repo.Create(&newRiddle); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar riddle", err)
	}

	return &newRiddle, nil
}

func (s *riddleService) GetRiddleByID(id uint) (*Riddle, error) {
	riddle, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Riddle não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar riddle", err)
	}

	return riddle, nil
}

func (s *riddleService) UpdateRiddle(id uint, request UpdateRiddleRequest) (*Riddle, error) {
	riddle := Riddle{
		Hint1:    request.Hint1,
		Hint2:    request.Hint2,
		Answer:   request.Answer,
		ImageURL: request.ImageURL,
		IsActive: request.IsActive,
	}

	if err := s.repo.Update(id, &riddle); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Riddle não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar riddle", err)
	}

	return s.GetRiddleByID(id)
}

// DeleteRiddle nunca apaga a linha: apenas marca o riddle como inativo
// (soft delete), preservando a ordem dos demais.
func (s *riddleService) DeleteRiddle(id uint) error {
	if err := s.repo.SoftDelete(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Riddle não encontrado", err)
		}
		return apierrors.InternalServerError("Erro ao remover riddle", err)
	}

	return nil
}

func (s *riddleService) GetRiddles(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*RiddleListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}

	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
	}

	if sortBy == "" {
		sortBy = "id"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"id":         true,
		"hint1":      true,
		"hint2":      true,
		"is_active":  true,
		"created_at": true,
	}

	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parametro 'sort_by' inválido", nil)
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("Parametro 'sort_order' inválido", nil)
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("Parametro 'search_by' e 'search_value' devem ser fornecidos juntos", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)

		allowedSearchFields := map[string]bool{
			"hint1":     true,
			"hint2":     true,
			"is_active": true,
		}

		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parametro 'search_by' inválido", nil)
		}
	}

	offset := (page - 1) * limit
	query := RiddleListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetRiddles(query)
}

// generateInviteCode gera um código curto de convite para equipes.
// Alfabeto sem caracteres ambíguos (O/0/I/1/L), 8 caracteres, crypto/rand —
// mesmo padrão de providers/token_provider.go. Colisões são resolvidas pelo
// serviço (GetTeamByCode + uniqueIndex).
var inviteCodeAlphabet = []byte("ABCDEFGHJKMNPQRSTUVWXYZ23456789")

func generateInviteCode() (string, error) {
	buf := make([]byte, 8)
	for i := range buf {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(inviteCodeAlphabet))))
		if err != nil {
			return "", err
		}
		buf[i] = inviteCodeAlphabet[n.Int64()]
	}
	return string(buf), nil
}

func (s *riddleService) newUniqueInviteCode() (string, error) {
	for attempt := 0; attempt < 10; attempt++ {
		code, err := generateInviteCode()
		if err != nil {
			return "", err
		}
		if _, err := s.repo.GetTeamByCode(code); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return code, nil
			}
			return "", err
		}
	}
	return "", errors.New("falha ao gerar código de convite único")
}

// ReplaceRiddlesFromCSV lê o CSV completo (título, subtítulo, resposta, link
// da imagem) e substitui totalmente a fila de riddles pelos novos, na ordem
// das linhas do arquivo. Os riddles anteriores são apagados fisicamente
// (hard delete), não apenas desativados — ver ReplaceAll.
//
// O replace é bloqueado se houver equipes em progresso: o hard delete recria
// todos os IDs de riddles, o que invalida o CurrentRiddleIndex das equipes.
func (s *riddleService) ReplaceRiddlesFromCSV(file io.Reader) ([]Riddle, error) {
	hasProgress, err := s.repo.HasTeamsInProgress()
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao verificar equipes em progresso", err)
	}
	if hasProgress {
		return nil, apierrors.ConflictError("Não é possível substituir riddles enquanto houver equipes em progresso", nil)
	}

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1

	rows, err := reader.ReadAll()
	if err != nil {
		return nil, apierrors.ValidationError("Erro ao ler o arquivo CSV", err)
	}

	if len(rows) == 0 {
		return nil, apierrors.ValidationError("CSV vazio", nil)
	}

	// Primeira linha é o cabeçalho.
	dataRows := rows[1:]
	if len(dataRows) == 0 {
		return nil, apierrors.ValidationError("CSV não contém nenhuma linha de dados", nil)
	}

	newRiddles := make([]*Riddle, 0, len(dataRows))
	for i, row := range dataRows {
		lineNumber := i + 2 // +1 pelo cabeçalho, +1 porque a contagem é 1-based

		if len(row) < 4 {
			return nil, apierrors.ValidationError(
				fmt.Sprintf("Linha %d do CSV inválida: esperado 4 colunas (título, subtítulo, resposta, link da imagem)", lineNumber),
				nil,
			)
		}

		title := strings.TrimSpace(row[0])
		subtitle := strings.TrimSpace(row[1])
		answer := strings.TrimSpace(row[2])
		imageURL := strings.TrimSpace(row[3])

		if title == "" || subtitle == "" || answer == "" {
			return nil, apierrors.ValidationError(
				fmt.Sprintf("Linha %d do CSV inválida: título, subtítulo e resposta são obrigatórios", lineNumber),
				nil,
			)
		}

		newRiddles = append(newRiddles, &Riddle{
			Hint1:    title,
			Hint2:    subtitle,
			Answer:   answer,
			ImageURL: imageURL,
			IsActive: true,
		})
	}

	created, err := s.repo.ReplaceAll(newRiddles)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao substituir riddles a partir do CSV", err)
	}

	return created, nil
}

// --- Jogo do participante (equipes) ---------

// CreateTeam cria uma equipe com o participante autenticado como fundador e
// gera o código de convite para os demais entrarem.
func (s *riddleService) CreateTeam(userNumber uint, request CreateMyTeamRequest) (*TeamView, error) {
	name := strings.TrimSpace(request.Name)

	if _, err := s.repo.GetTeamByUserNumber(userNumber); err == nil {
		return nil, apierrors.ConflictError(ErrUserAlreadyInTeam.Error(), ErrUserAlreadyInTeam)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar equipe existente", err)
	}

	code, err := s.newUniqueInviteCode()
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao gerar código de convite", err)
	}

	team, err := s.repo.CreateTeam(name, code, userNumber)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar equipe", err)
	}

	view := TeamToView(team)
	return &view, nil
}

// JoinTeam adiciona o participante autenticado à equipe identificada pelo
// código de convite.
func (s *riddleService) JoinTeam(userNumber uint, code string) (*TeamView, error) {
	normalized := strings.ToUpper(strings.TrimSpace(code))
	if normalized == "" {
		return nil, apierrors.ValidationError("Código de convite inválido", nil)
	}

	team, err := s.repo.GetTeamByCode(normalized)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Código de convite inválido", nil)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar equipe", err)
	}

	if _, err := s.repo.GetTeamByUserNumber(userNumber); err == nil {
		return nil, apierrors.ConflictError(ErrUserAlreadyInTeam.Error(), ErrUserAlreadyInTeam)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar equipe existente", err)
	}

	if err := s.repo.AddMember(team.ID, userNumber); err != nil {
		if errors.Is(err, ErrTeamFull) {
			return nil, apierrors.ConflictError(ErrTeamFull.Error(), ErrTeamFull)
		}
		return nil, apierrors.InternalServerError("Erro ao entrar na equipe", err)
	}

	// Recarrega com o novo membro incluído.
	team, err = s.repo.GetTeamByUserNumber(userNumber)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao recarregar equipe", err)
	}

	view := TeamToView(team)
	return &view, nil
}

// GetMyGame devolve o estado do jogo do participante: a equipe (ou nil), o
// total de enigmas ativos e o próximo enigma a resolver.
func (s *riddleService) GetMyGame(userNumber uint) (*MyGameResponse, error) {
	response := &MyGameResponse{}

	riddlesTotal, err := s.repo.CountActiveRiddles()
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao contar enigmas ativos", err)
	}
	response.RiddlesTotal = riddlesTotal

	team, err := s.repo.GetTeamByUserNumber(userNumber)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response, nil // sem equipe ainda
		}
		return nil, apierrors.InternalServerError("Erro ao buscar equipe", err)
	}

	view := TeamToView(team)
	response.Team = &view

	current, err := s.repo.GetNextActiveRiddle(team.CurrentRiddleIndex)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response, nil // time terminou (CurrentRiddle nil)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar próximo enigma", err)
	}
	currentPublic := RiddleToPublic(current)
	response.CurrentRiddle = &currentPublic

	return response, nil
}

// resolveNextRiddle converte o resultado de GetNextActiveRiddle: riddle ativo,
// time já terminou (nil), ou erro de domínio quando ainda há enigma a resolver
// mas o índice corrente está esgotado (cenário de consistência).
func (s *riddleService) resolveNextRiddle(team *Team) (*Riddle, bool, error) {
	next, err := s.repo.GetNextActiveRiddle(team.CurrentRiddleIndex)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, true, nil // sem próximo ativo → terminou
		}
		return nil, false, apierrors.InternalServerError("Erro ao buscar próximo enigma", err)
	}
	return next, false, nil
}

// SolveRiddle valida a resposta do participante para o próximo enigma da
// equipe. Correto → avança o progresso (ou conclui o jogo). Incorreto →
// mantém o mesmo enigma, tentativas ilimitadas.
func (s *riddleService) SolveRiddle(userNumber uint, riddleID uint, answer string) (*SolveResult, error) {
	team, err := s.repo.GetTeamByUserNumber(userNumber)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.ValidationError("Você precisa estar em uma equipe para resolver enigmas", nil)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar equipe", err)
	}

	next, finished, err := s.resolveNextRiddle(team)
	if err != nil {
		return nil, err
	}
	if finished {
		return &SolveResult{
			Correct:       false,
			Message:       "Seu time já completou o jogo de enigmas!",
			CurrentRiddle: nil,
			Finished:      true,
		}, nil
	}

	if riddleID != next.ID {
		return nil, apierrors.ValidationError(ErrRiddleNotUnlocked.Error(), ErrRiddleNotUnlocked)
	}

	normalized := strings.TrimSpace(answer)
	correct := strings.EqualFold(normalized, next.Answer)
	if !correct {
		return &SolveResult{
			Correct: false,
			Message: "Resposta incorreta! Tente novamente.",
		}, nil
	}

	// Acertou: avança de forma atômica. Se RowsAffected == 0, outra resposta
	// concorrente já avançou — recarregamos o estado e devolvemos o corrente.
	advanced, err := s.repo.AdvanceRiddle(team.ID, team.CurrentRiddleIndex, next.ID)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao avançar enigma", err)
	}

	if !advanced {
		team, err = s.repo.GetTeamByUserNumber(userNumber)
		if err != nil {
			return nil, apierrors.InternalServerError("Erro ao recarregar equipe", err)
		}
		current, _, err := s.resolveNextRiddle(team)
		if err != nil {
			return nil, err
		}
		if current == nil {
			return &SolveResult{Correct: true, Message: "Resposta correta!", CurrentRiddle: nil, Finished: true}, nil
		}
		currentPublic := RiddleToPublic(current)
		return &SolveResult{Correct: true, Message: "Resposta correta!", CurrentRiddle: &currentPublic, Finished: false}, nil
	}

	// Sem próximo ativo após avançar → equipe concluiu o jogo.
	nextAfter, err := s.repo.GetNextActiveRiddle(next.ID + 1)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := s.repo.SetFinished(team.ID); err != nil {
				return nil, apierrors.InternalServerError("Erro ao marcar jogo concluído", err)
			}
			return &SolveResult{Correct: true, Message: "Parabéns! Seu time completou o jogo de enigmas!", CurrentRiddle: nil, Finished: true}, nil
		}
		return nil, apierrors.InternalServerError("Erro ao buscar próximo enigma", err)
	}
	nextPublic := RiddleToPublic(nextAfter)
	return &SolveResult{Correct: true, Message: "Resposta correta!", CurrentRiddle: &nextPublic, Finished: false}, nil
}
