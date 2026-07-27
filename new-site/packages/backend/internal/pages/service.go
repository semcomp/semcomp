package pages

import (
	"backend/internal/apierrors"
	"slices"
)

type Service interface {
	GetPageAvailability(page string) (bool, error)
	GetAllPagesAvailability() map[string]bool
	SetPageAvailability(page string, available bool) error
}

type service struct {
	pages        []string
	availability map[string]bool
}

func NewService(pages []string) Service {
	availability := make(map[string]bool)

	for _, page := range pages {
		availability[page] = true
	}

	return &service{
		pages:        pages,
		availability: availability,
	}
}

func (s *service) GetPageAvailability(page string) (bool, error) {
	if !slices.Contains(s.pages, page) {
		return false, apierrors.NotFoundError("Página não encontrada", nil)
	}

	available, exists := s.availability[page]

	if !exists {
		return false, apierrors.InternalServerError("Falha ao obter disponibilidade da página", nil)
	}

	return available, nil
}

func (s *service) GetAllPagesAvailability() map[string]bool {
	result := make(map[string]bool, len(s.pages))
	for _, page := range s.pages {
		result[page] = s.availability[page]
	}
	return result
}

func (s *service) SetPageAvailability(page string, available bool) error {
	if !slices.Contains(s.pages, page) {
		return apierrors.NotFoundError("Página não encontrada", nil)
	}

	s.availability[page] = available
	return nil
}
