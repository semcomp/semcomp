package presencesettings

import (
	"errors"
	"fmt"
	"log"
	"strings"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

// RateRecalculator dispara o recálculo das taxas de presença dos usuários.
type RateRecalculator interface {
	RecalculateAll() error
}

type PresenceSettingsService interface {
	SetRateRecalculator(recalculator RateRecalculator)
	InitializeDefaults() error
	CreatePresenceTypeWeight(request CreatePresenceTypeWeightRequest) (*PresenceTypeWeight, error)
	GetWeights() (*PresencesSettingsListResult, error)
	UpdatePresenceTypeWeight(typeName string, request UpdatePresenceTypeWeightRequest) (*PresenceTypeWeight, error)
	DeletePresenceTypeWeight(typeName string) error
}

type presenceSettingsService struct {
	repo         PresenceSettingsRepository
	db           *gorm.DB
	recalculator RateRecalculator
}

func NewPresenceSettingsService(repo PresenceSettingsRepository, db *gorm.DB) PresenceSettingsService {
	return &presenceSettingsService{repo: repo, db: db}
}

func (s *presenceSettingsService) SetRateRecalculator(recalculator RateRecalculator) {
	s.recalculator = recalculator
}

func boolPtr(b bool) *bool { return &b }

var DefaultTypeWeights = []CreatePresenceTypeWeightRequest{
	{TypeName: "Palestra", Weight: 1.0, DefaultHasAttendance: boolPtr(true)},
	{TypeName: "Vitrine", Weight: 0.5, DefaultHasAttendance: boolPtr(true)},
	{TypeName: "Rodas de conversa", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Minicurso", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Concursos", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Luau", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Gamenight", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Oficina", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Contest", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Jogos de rua", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Coffee", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Coffee Livre", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Coffee Noturno", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Feira", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Abertura", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
	{TypeName: "Encerramento", Weight: 0.0, DefaultHasAttendance: boolPtr(false)},
}

func (s *presenceSettingsService) InitializeDefaults() error {
	existing, err := s.repo.GetAll()
	if err != nil {
		return errors.New("erro na inicialização dos pesos de presença")
	}

	existingSet := make(map[string]bool, len(existing))
	for _, w := range existing {
		existingSet[strings.ToLower(strings.TrimSpace(w.TypeName))] = true
	}

	for _, def := range DefaultTypeWeights {
		key := strings.ToLower(strings.TrimSpace(def.TypeName))
		if existingSet[key] {
			continue
		}
		if _, err := s.CreatePresenceTypeWeight(def); err != nil {
			return errors.New("erro na inicialização dos pesos de presença")
		}
	}

	return nil
}

func (s *presenceSettingsService) CreatePresenceTypeWeight(request CreatePresenceTypeWeightRequest) (*PresenceTypeWeight, error) {
	typeName := strings.TrimSpace(request.TypeName)

	existing, err := s.repo.GetByTypeName(typeName)
	if err == nil && existing != nil {
		return nil, apierrors.ConflictError("Já existe um peso cadastrado para este tipo de evento", err)
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.InternalServerError("Erro ao verificar peso já existente", err)
	}

	defaultHA := false
	if request.DefaultHasAttendance != nil {
		defaultHA = *request.DefaultHasAttendance
	}

	newWeight := PresenceTypeWeight{
		TypeName:             typeName,
		Weight:               request.Weight,
		DefaultHasAttendance: defaultHA,
	}

	if err := s.repo.Create(&newWeight); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar peso de presença", err)
	}

	s.recalculateAll()

	return &newWeight, nil
}

func (s *presenceSettingsService) GetWeights() (*PresencesSettingsListResult, error) {
	weights, err := s.repo.GetAll()
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao listar pesos de presença", err)
	}
	return &PresencesSettingsListResult{Weights: weights}, nil
}

func (s *presenceSettingsService) UpdatePresenceTypeWeight(typeName string, request UpdatePresenceTypeWeightRequest) (*PresenceTypeWeight, error) {
	current, err := s.repo.GetByTypeName(typeName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Peso de presença não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar peso de presença", err)
	}

	newTypeName := strings.TrimSpace(request.TypeName)

	if !strings.EqualFold(newTypeName, strings.TrimSpace(current.TypeName)) {
		existing, err := s.repo.GetByTypeName(newTypeName)
		if err == nil && existing != nil {
			return nil, apierrors.ConflictError("Já existe um peso cadastrado para este tipo de evento", err)
		} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.InternalServerError("Erro ao verificar peso já existente", err)
		}
	}

	defaultHA := current.DefaultHasAttendance
	if request.DefaultHasAttendance != nil {
		defaultHA = *request.DefaultHasAttendance
	}

	updated := PresenceTypeWeight{
		TypeName:             newTypeName,
		Weight:               request.Weight,
		DefaultHasAttendance: defaultHA,
	}

	if err := s.repo.UpdateByTypeName(typeName, &updated); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Peso de presença não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar peso de presença", err)
	}

	s.recalculateAll()

	return &updated, nil
}

func (s *presenceSettingsService) DeletePresenceTypeWeight(typeName string) error {
	weight, err := s.repo.GetByTypeName(typeName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Peso de presença não encontrado", err)
		}
		return apierrors.InternalServerError("Erro ao buscar peso de presença", err)
	}

	var eventCount int64
	if err := s.db.Table("events").Where("presence_type_weight_id = ?", weight.ID).Count(&eventCount).Error; err != nil {
		return apierrors.InternalServerError("Erro ao verificar eventos vinculados", err)
	}
	if eventCount > 0 {
		return apierrors.ConflictError(fmt.Sprintf("Não é possível remover: existem %d evento(s) vinculado(s) a este tipo", eventCount), nil)
	}

	err = s.repo.DeleteByTypeName(typeName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Peso de presença não encontrado", err)
		}
		return apierrors.InternalServerError("Erro ao remover peso de presença", err)
	}

	s.recalculateAll()

	return nil
}

func (s *presenceSettingsService) recalculateAll() {
	if s.recalculator == nil {
		return
	}
	if err := s.recalculator.RecalculateAll(); err != nil {
		log.Printf("[presencesettings] erro ao recalcular taxas de presença: %v", err)
	}
}
