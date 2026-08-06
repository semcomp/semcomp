package sitestat

import "backend/internal/apierrors"

type SiteStatService struct {
	repo *SiteStatRepository
}

func NewSiteStatService(repo *SiteStatRepository) *SiteStatService {
	return &SiteStatService{repo: repo}
}

func (s *SiteStatService) RecordVisit() error {
	if err := s.repo.Increment("visitor_count"); err != nil {
		return apierrors.InternalServerError("Erro ao registrar visita", err)
	}
	return nil
}

func (s *SiteStatService) GetVisitorCount() (int64, error) {
	count, err := s.repo.Get("visitor_count")
	if err != nil {
		return 0, apierrors.InternalServerError("Erro ao buscar contador de visitas", err)
	}
	return count, nil
}
