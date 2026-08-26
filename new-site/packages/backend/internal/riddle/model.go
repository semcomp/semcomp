package riddle

import (
	"errors"
	"time"

	"backend/internal/user"
)

// Máximo de membros permitido em uma equipe.
const MaxTeamSize = 5

// Riddle representa um enigma do jogo de sequência.
// O ID do enigma é a sua posição na ordem: os enigmas devem ser resolvidos em
// sequência (id 1, depois 2, 3, ...), nunca fora de ordem.
type Riddle struct {
	ID    uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Hint1 string `gorm:"type:text;not null" json:"hint_1"`
	Hint2 string `gorm:"type:text;not null" json:"hint_2"`
	// Answer é serializada normalmente aqui porque este struct hoje só é
	// exposto pelas rotas de backoffice (que precisam ver/editar a resposta).
	// Um futuro endpoint público pro participante jogar NÃO deve serializar
	// este struct diretamente — deve usar um DTO próprio sem Answer, no mesmo
	// padrão de user.SafeUser (que esconde PasswordHash).
	Answer   string `gorm:"type:text;not null" json:"answer"`
	ImageURL string `gorm:"type:text" json:"image_url"`
	// IsActive controla tanto a exclusão lógica (soft delete) quanto a
	// visibilidade do enigma para os participantes. "Último enigma" é sempre
	// MAX(id) filtrando apenas os riddles com IsActive = true.
	IsActive  bool      `gorm:"not null;default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Team representa uma equipe de participantes jogando o jogo de enigmas.
// Cada equipe avança pela sequência de enigmas; o progresso é controlado pelo
// índice do próximo enigma a ser resolvido (CurrentRiddleIndex).
// Quando CurrentRiddleIndex ultrapassa o último enigma, o time terminou o jogo.
type Team struct {
	ID   uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"size:200;not null;uniqueIndex" json:"name"`
	// Code é o código de convite do time (auto-serviço): outros participantes
	// entram na equipe informando esse código curto (ver JoinTeamRequest).
	Code string `gorm:"size:10;not null;uniqueIndex" json:"code"`
	// Índice (ID) do próximo enigma a resolver. 0 = ainda não resolveu o primeiro.
	// Quando > maior ID de enigma, o time já resolveu todos (final riddle).
	CurrentRiddleIndex uint       `gorm:"not null;default:0" json:"current_riddle_index"`
	FinishedAt         *time.Time `json:"finished_at,omitempty"` // preenchido quando o último enigma é resolvido
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`

	Members []TeamMember `gorm:"foreignKey:TeamID;constraint:OnDelete:CASCADE" json:"members,omitempty"`
}

// TeamMember relaciona um participante (user.User) a uma equipe (Team).
// O tamanho da equipe é limitado a MaxTeamSize membros. O índice único em
// UserNumber garante a nível de banco que um participante pertence a no máximo
// uma equipe (a PK composta TimeID+UserNumber não impõe isso sozinha).
type TeamMember struct {
	TeamID     uint      `gorm:"primaryKey;not null" json:"team_id"`
	UserNumber uint      `gorm:"primaryKey;not null;uniqueIndex:idx_team_member_user" json:"user_number"` // referencia user.User.UserNumber
	JoinedAt   time.Time `json:"joined_at"`

	User *user.User `gorm:"foreignKey:UserNumber;references:UserNumber;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}

// --- Erros de domínio ---

var (
	ErrTeamFull          = errors.New("equipe já atingiu o limite de membros")
	ErrRiddleNotUnlocked = errors.New("enigma ainda não liberado; resolva os anteriores em ordem")
	ErrUserAlreadyInTeam = errors.New("usuário já pertence a uma equipe")
	ErrNoActiveRiddle    = errors.New("não há enigma ativo disponível")
)

// DTOs de Requisição ---------

type CreateRiddleRequest struct {
	Hint1    string `json:"hint_1" binding:"required"`
	Hint2    string `json:"hint_2" binding:"required"`
	Answer   string `json:"answer" binding:"required"`
	ImageURL string `json:"image_url"`
}

type UpdateRiddleRequest struct {
	Hint1    string `json:"hint_1" binding:"required"`
	Hint2    string `json:"hint_2" binding:"required"`
	Answer   string `json:"answer" binding:"required"`
	ImageURL string `json:"image_url"`
	IsActive bool   `json:"is_active"`
}

type CreateTeamRequest struct {
	Name    string `json:"name" binding:"required,max=200"`
	Members []uint `json:"members" binding:"required,min=1,max=5"` // user_numbers dos participantes
}

// CreateMyTeamRequest é o DTO do fluxo auto-serviço do site: o próprio
// participante autenticado cria a equipe (vira o membro fundador) e recebe o
// código de convite para os demais entrarem. A lista de members do
// CreateTeamRequest fica reservada para um eventual CRUD de times no backoffice.
type CreateMyTeamRequest struct {
	Name string `json:"name" binding:"required,max=200"`
}

type SolveRiddleRequest struct {
	RiddleID uint   `json:"riddle_id" binding:"required"`
	Answer   string `json:"answer" binding:"required"`
}

type JoinTeamRequest struct {
	Code string `json:"code" binding:"required"`
}

// --- DTOs de resposta pública (jogo do participante) ---------

// PublicRiddle é a versão de um enigma exposta ao participante. NUNCA
// serializa Answer — protegido pelo mesmo padrão de user.SafeUser (ver o
// aviso no struct Riddle).
type PublicRiddle struct {
	ID       uint   `json:"id"`
	Hint1    string `json:"hint_1"`
	Hint2    string `json:"hint_2"`
	ImageURL string `json:"image_url"`
}

func RiddleToPublic(r *Riddle) PublicRiddle {
	return PublicRiddle{
		ID:       r.ID,
		Hint1:    r.Hint1,
		Hint2:    r.Hint2,
		ImageURL: r.ImageURL,
	}
}

// TeamMemberView expõe apenas user_number + name dos membros. O Team cru
// serializaria user.User inteiro (email, age, gender, ...) — não devemos
// vazar dados pessoais dos colegas de equipe.
type TeamMemberView struct {
	UserNumber uint   `json:"user_number"`
	Name       string `json:"name"`
}

type TeamView struct {
	ID                 uint             `json:"id"`
	Name               string           `json:"name"`
	Code               string           `json:"code"`
	CurrentRiddleIndex uint             `json:"current_riddle_index"`
	FinishedAt         *time.Time       `json:"finished_at,omitempty"`
	Members            []TeamMemberView `json:"members"`
}

func TeamToView(t *Team) TeamView {
	view := TeamView{
		ID:                 t.ID,
		Name:               t.Name,
		Code:               t.Code,
		CurrentRiddleIndex: t.CurrentRiddleIndex,
		FinishedAt:         t.FinishedAt,
		Members:            make([]TeamMemberView, 0, len(t.Members)),
	}
	for _, m := range t.Members {
		memberView := TeamMemberView{UserNumber: m.UserNumber}
		if m.User != nil {
			memberView.Name = m.User.Name
		}
		view.Members = append(view.Members, memberView)
	}
	return view
}

// MyGameResponse é o estado completo do jogo para o participante.
// Team nulo significa que o usuário ainda não está em nenhuma equipe.
type MyGameResponse struct {
	Team          *TeamView     `json:"team"`
	RiddlesTotal  int64         `json:"riddles_total"`
	CurrentRiddle *PublicRiddle `json:"current_riddle"`
}

// SolveResult é o retorno da tentativa de resposta.
// Finished=true (com CurrentRiddle nil) indica que o time completou o jogo.
type SolveResult struct {
	Correct       bool          `json:"correct"`
	Message       string        `json:"message"`
	CurrentRiddle *PublicRiddle `json:"current_riddle"`
	Finished      bool          `json:"finished"`
}

// --- DTOs de Listagem ---------

type RiddleListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type RiddleListResult struct {
	Riddles         []Riddle `json:"riddles"`
	TotalRecords    int64    `json:"total_records"`
	FilteredRecords int64    `json:"filtered_records"`
}

type TeamListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type TeamListResult struct {
	Teams           []Team `json:"teams"`
	TotalRecords    int64  `json:"total_records"`
	FilteredRecords int64  `json:"filtered_records"`
}
