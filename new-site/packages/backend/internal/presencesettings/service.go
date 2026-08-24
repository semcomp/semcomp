package presencesettings

import (
	"errors"
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
	repo        PresenceSettingsRepository
	recalculator RateRecalculator
}

func NewPresenceSettingsService(repo PresenceSettingsRepository) PresenceSettingsService {
	return &presenceSettingsService{repo: repo}
}

func (s *presenceSettingsService) SetRateRecalculator(recalculator RateRecalculator) {
	s.recalculator = recalculator
}

var DefaultTypeWeights = []CreatePresenceTypeWeightRequest{
	{TypeName: "Palestra", Weight: 1.0},
	{TypeName: "Vitrine", Weight: 0.5},
}

func (s *presenceSettingsService) InitializeDefaults() error {
	count, err := s.repo.GetAll()
	if err != nil {
		return errors.New("erro na inicialização dos pesos de presença")
	}
	if len(count) > 0 {
		return nil
	}

	for _, def := range DefaultTypeWeights {
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

	newWeight := PresenceTypeWeight{
		TypeName: typeName,
		Weight:   request.Weight,
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

	updated := PresenceTypeWeight{
		TypeName: newTypeName,
		Weight:   request.Weight,
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
	err := s.repo.DeleteByTypeName(typeName)
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
