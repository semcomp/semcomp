package riddle

import (
	"fmt"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type RiddleRepository interface {
	Create(riddle *Riddle) error
	GetByID(id uint) (*Riddle, error)
	Update(id uint, riddle *Riddle) error
	SoftDelete(id uint) error
	GetRiddles(query RiddleListQuery) (*RiddleListResult, error)
	ReplaceAll(newRiddles []*Riddle) ([]Riddle, error)

	// Jogo do participante (equipes) ---------
	CountActiveRiddles() (int64, error)
	GetNextActiveRiddle(fromID uint) (*Riddle, error)
	CreateTeam(name, code string, leaderUserNumber uint) (*Team, error)
	GetTeamByUserNumber(userNumber uint) (*Team, error)
	GetTeamByCode(code string) (*Team, error)
	AddMember(teamID uint, userNumber uint) error
	AdvanceRiddle(teamID, currentIndex, nextIndex uint) (bool, error)
	SetFinished(teamID uint) error
	HasTeamsInProgress() (bool, error)
}

type riddleRepository struct {
	db *gorm.DB
}

func NewRiddleRepository(db *gorm.DB) RiddleRepository {
	return &riddleRepository{db: db}
}

func (r *riddleRepository) Create(riddle *Riddle) error {
	return r.db.Create(riddle).Error
}

func (r *riddleRepository) GetByID(id uint) (*Riddle, error) {
	var riddle Riddle
	err := r.db.First(&riddle, id).Error
	if err != nil {
		return nil, err
	}

	return &riddle, nil
}

// Update usa .Updates(map[...]) em vez de .Save()/update por struct: GORM
// ignora campos zero-value (como IsActive=false) em updates por struct, o
// que quebraria o soft delete via este mesmo método.
func (r *riddleRepository) Update(id uint, riddle *Riddle) error {
	result := r.db.Model(&Riddle{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"hint1":     riddle.Hint1,
			"hint2":     riddle.Hint2,
			"answer":    riddle.Answer,
			"image_url": riddle.ImageURL,
			"is_active": riddle.IsActive,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *riddleRepository) SoftDelete(id uint) error {
	result := r.db.Model(&Riddle{}).Where("id = ?", id).Update("is_active", false)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func applySearchFilter(dbQuery *gorm.DB, query RiddleListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "hint1":
		return dbQuery.Where("hint1 ILIKE ?", "%"+query.SearchValue+"%")
	case "hint2":
		return dbQuery.Where("hint2 ILIKE ?", "%"+query.SearchValue+"%")
	case "is_active":
		return dbQuery.Where("is_active = ?", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{"id", "hint1", "hint2", "is_active", "created_at"}

	field := strings.ToLower(sortBy)
	isAllowedField := slices.Contains(allowedSortFields, field)
	if !isAllowedField {
		return "", fmt.Errorf("invalid sort field")
	}

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}

	return field + " " + order, nil
}

func (r *riddleRepository) GetRiddles(query RiddleListQuery) (*RiddleListResult, error) {
	var riddles []Riddle
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Riddle{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(r.db.Model(&Riddle{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&Riddle{}), query)
	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&riddles).Error
	if err != nil {
		return nil, err
	}

	return &RiddleListResult{
		Riddles:         riddles,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

// ReplaceAll substitui totalmente a fila de riddles: apaga fisicamente (hard
// delete) todos os riddles existentes e cria os novos, um a um e na ordem
// recebida, garantindo que o autoincrement do ID preserve a ordem do CSV.
//
// Hard delete é seguro aqui porque, antes do início da competição, não há
// nenhum registro de Team/TeamMember referenciando riddles — não existe risco
// de FK ou perda de progresso de equipe ao apagar a fila anterior.
func (r *riddleRepository) ReplaceAll(newRiddles []*Riddle) ([]Riddle, error) {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("1 = 1").Delete(&Riddle{}).Error; err != nil {
			return err
		}

		for i := range newRiddles {
			if err := tx.Create(newRiddles[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	created := make([]Riddle, len(newRiddles))
	for i, riddle := range newRiddles {
		created[i] = *riddle
	}

	return created, nil
}

// --- Jogo do participante (equipes) ---------

// CountActiveRiddles conta quantos enigmas estão ativos (visíveis ao jogador).
func (r *riddleRepository) CountActiveRiddles() (int64, error) {
	var count int64
	err := r.db.Model(&Riddle{}).Where("is_active = ?", true).Count(&count).Error
	return count, err
}

// GetNextActiveRiddle retorna o primeiro riddle ativo com ID >= fromID, na
// ordem da fila. Devolve gorm.ErrRecordNotFound quando não há próximo — o
// sinal de que o time terminou o jogo. Buracos (soft delete) são pulados.
func (r *riddleRepository) GetNextActiveRiddle(fromID uint) (*Riddle, error) {
	var riddle Riddle
	err := r.db.Where("id >= ? AND is_active = ?", fromID, true).
		Order("id ASC").
		First(&riddle).Error
	if err != nil {
		return nil, err
	}
	return &riddle, nil
}

// CreateTeam cria a equipe com o fundador já como membro, em transação.
func (r *riddleRepository) CreateTeam(name, code string, leaderUserNumber uint) (*Team, error) {
	team := Team{
		Name: name,
		Code: code,
	}

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&team).Error; err != nil {
			return err
		}

		member := TeamMember{
			TeamID:     team.ID,
			UserNumber: leaderUserNumber,
			JoinedAt:   time.Now(),
		}
		return tx.Create(&member).Error
	})
	if err != nil {
		return nil, err
	}

	return r.getTeamByID(team.ID)
}

func (r *riddleRepository) getTeamByID(id uint) (*Team, error) {
	var team Team
	err := r.db.Preload("Members.User").First(&team, id).Error
	if err != nil {
		return nil, err
	}
	return &team, nil
}

// GetTeamByUserNumber retorna a equipe da qual o participante faz parte, ou
// gorm.ErrRecordNotFound se ele ainda não está em nenhuma.
func (r *riddleRepository) GetTeamByUserNumber(userNumber uint) (*Team, error) {
	var teamID uint
	err := r.db.Model(&TeamMember{}).
		Where("user_number = ?", userNumber).
		Pluck("team_id", &teamID).Error
	if err != nil {
		return nil, err
	}
	if teamID == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return r.getTeamByID(teamID)
}

// GetTeamByCode retorna a equipe pelo código de convite, ou
// gorm.ErrRecordNotFound se o código não existe.
func (r *riddleRepository) GetTeamByCode(code string) (*Team, error) {
	var id uint
	err := r.db.Model(&Team{}).Where("code = ?", code).Pluck("id", &id).Error
	if err != nil {
		return nil, err
	}
	if id == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return r.getTeamByID(id)
}

// AddMember adiciona um participante à equipe, respeitando MaxTeamSize.
// O row-lock na linha do time serializa entradas simultâneas à mesma equipe:
// duas requisições de join em paralelo não podem estourar o limite juntas.
func (r *riddleRepository) AddMember(teamID uint, userNumber uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var team Team
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&team, teamID).Error; err != nil {
			return err
		}

		var count int64
		if err := tx.Model(&TeamMember{}).Where("team_id = ?", teamID).Count(&count).Error; err != nil {
			return err
		}
		if count >= MaxTeamSize {
			return ErrTeamFull
		}

		member := TeamMember{
			TeamID:     teamID,
			UserNumber: userNumber,
			JoinedAt:   time.Now(),
		}
		return tx.Create(&member).Error
	})
}

// AdvanceRiddle move o índice do time de forma atômica e condicional:
// o UPDATE só tem efeito se current_riddle_index ainda for o valor antigo.
// Duas respostas corretas simultâneas — só a primeira avança; a segunda
// recebe RowsAffected == 0 e o service devolve o estado corrente (idempotente),
// sem pular enigmas.
func (r *riddleRepository) AdvanceRiddle(teamID, currentIndex, nextIndex uint) (bool, error) {
	result := r.db.Model(&Team{}).
		Where("id = ? AND current_riddle_index = ?", teamID, currentIndex).
		Update("current_riddle_index", nextIndex)
	if result.Error != nil {
		return false, result.Error
	}
	return result.RowsAffected > 0, nil
}

// SetFinished marca o fim do jogo para a equipe.
func (r *riddleRepository) SetFinished(teamID uint) error {
	now := time.Now()
	return r.db.Model(&Team{}).Where("id = ?", teamID).
		Updates(map[string]interface{}{"finished_at": &now}).Error
}

// HasTeamsInProgress indica se há alguma equipe que já resolveu ao menos um
// enigma. Usado para bloquear o ReplaceRiddlesFromCSV (que recria todos os
// IDs de riddles) enquanto houver partida em andamento.
func (r *riddleRepository) HasTeamsInProgress() (bool, error) {
	var count int64
	err := r.db.Model(&Team{}).Where("current_riddle_index > ?", 0).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
