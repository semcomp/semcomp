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
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Hint1     string    `gorm:"type:text;not null" json:"hint_1"`
	Hint2     string    `gorm:"type:text;not null" json:"hint_2"`
	Answer    string    `gorm:"type:text;not null" json:"-"`
	ImageURL  string    `gorm:"type:text" json:"image_url"`
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
	// Código único de convite utilizado pelos participantes para entrar no time.
	Code string `gorm:"size:12;not null;uniqueIndex" json:"code"`
	// Índice (ID) do próximo enigma a resolver. 0 = ainda não resolveu o primeiro.
	// Quando > maior ID de enigma, o time já resolveu todos (final riddle).
	CurrentRiddleIndex uint       `gorm:"not null;default:0" json:"current_riddle_index"`
	FinishedAt         *time.Time `json:"finished_at,omitempty"` // preenchido quando o último enigma é resolvido
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`

	Members []TeamMember `gorm:"foreignKey:TeamID;constraint:OnDelete:CASCADE" json:"members,omitempty"`
}

// TeamMember relaciona um participante (user.User) a uma equipe (Team).
// O tamanho da equipe é limitado a MaxTeamSize membros.
type TeamMember struct {
	TeamID     uint      `gorm:"primaryKey;not null" json:"team_id"`
	UserNumber uint      `gorm:"primaryKey;not null" json:"user_number"` // referencia user.User.UserNumber
	JoinedAt   time.Time `json:"joined_at"`

	User *user.User `gorm:"foreignKey:UserNumber;references:UserNumber;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}

// --- Erros de domínio ---

var (
	ErrTeamFull          = errors.New("equipe já atingiu o limite de membros")
	ErrRiddleNotFound    = errors.New("enigma não encontrado")
	ErrRiddleNotUnlocked = errors.New("enigma ainda não liberado; resolva os anteriores em ordem")
	ErrWrongAnswer       = errors.New("resposta incorreta")
	ErrUserAlreadyInTeam = errors.New("participante já faz parte de uma equipe")
	ErrGameFinished      = errors.New("o time já resolveu todos os enigmas")
)

// DTOs de Requisição ---------

type CreateRiddleRequest struct {
	Hint1    string `json:"hint_1" binding:"required"`
	Hint2    string `json:"hint_2" binding:"required"`
	Answer   string `json:"answer" binding:"required"`
	ImageURL string `json:"image_url"`
}

type CreateTeamRequest struct {
	Name    string `json:"name" binding:"required,max=200"`
	Members []uint `json:"members" binding:"required,min=1,max=5"` // user_numbers dos participantes
}

type SolveRiddleRequest struct {
	RiddleID uint   `json:"riddle_id" binding:"required"`
	Answer   string `json:"answer" binding:"required"`
}

type JoinTeamRequest struct {
	Code string `json:"code" binding:"required"`
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
