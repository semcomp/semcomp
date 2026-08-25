package riddle

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
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

// ReplaceRiddlesFromCSV lê o CSV completo (título, subtítulo, resposta, link
// da imagem) e substitui totalmente a fila de riddles pelos novos, na ordem
// das linhas do arquivo. Os riddles anteriores são apagados fisicamente
// (hard delete), não apenas desativados — ver ReplaceAll.
func (s *riddleService) ReplaceRiddlesFromCSV(file io.Reader) ([]Riddle, error) {
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
