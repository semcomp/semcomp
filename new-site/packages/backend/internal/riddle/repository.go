package riddle

import (
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

type RiddleRepository interface {
	Create(riddle *Riddle) error
	GetByID(id uint) (*Riddle, error)
	Update(id uint, riddle *Riddle) error
	SoftDelete(id uint) error
	GetRiddles(query RiddleListQuery) (*RiddleListResult, error)
	ReplaceAll(newRiddles []*Riddle) ([]Riddle, error)
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
