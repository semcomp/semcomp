package sponsor

import (
	"errors"
	"strings"
	"time"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type SponsorService interface {
	GetSponsors(page, limit int, sortBy, sortOrder, searchBy, searchValue string) (*SponsorListResult, error)
	GetPublicSponsors() ([]PublicSponsor, error)
	GetSponsorByCNPJ(cnpj string) (*Sponsor, error)
	CreateSponsor(req CreateSponsorRequest, logo string) (*Sponsor, error)
	UpdateSponsor(cnpj string, req UpdateSponsorRequest, logo string) (*Sponsor, error)
	DeleteSponsor(cnpj string) error
	RecordClick(cnpj string) (*Sponsor, error)
	GetPackages(cnpj string, year int) ([]SponsorPackage, error)
	AddPackage(cnpj string, req AddPackageRequest) (*SponsorPackage, error)
	RemovePackage(cnpj string, year int, packageName string) error
}

type sponsorService struct {
	repo SponsorRepository
}

func NewSponsorService(repo SponsorRepository) SponsorService {
	return &sponsorService{repo: repo}
}

func (s *sponsorService) GetPublicSponsors() ([]PublicSponsor, error) {
	year := time.Now().Year()
	sponsors, err := s.repo.GetPublic(year)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar patrocinadores", err)
	}
	result := make([]PublicSponsor, len(sponsors))
	for i, sp := range sponsors {
		result[i] = PublicSponsor{
			CNPJ:    sp.CNPJ,
			Name:    sp.Name,
			Logo:    sp.Logo,
			Website: sp.Website,
		}
	}
	return result, nil
}

func (s *sponsorService) GetSponsorByCNPJ(cnpj string) (*Sponsor, error) {
	sp, err := s.repo.GetByCNPJ(cnpj)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Patrocinador não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar patrocinador", err)
	}
	return sp, nil
}

func (s *sponsorService) CreateSponsor(req CreateSponsorRequest, logo string) (*Sponsor, error) {
	sp := &Sponsor{
		CNPJ:    req.CNPJ,
		Name:    req.Name,
		Website: req.Website,
		Logo:    logo,
	}
	if err := s.repo.Create(sp); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar patrocinador", err)
	}
	created, err := s.repo.GetByCNPJ(sp.CNPJ)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar patrocinador criado", err)
	}
	return created, nil
}

func (s *sponsorService) UpdateSponsor(cnpj string, req UpdateSponsorRequest, logo string) (*Sponsor, error) {
	if _, err := s.GetSponsorByCNPJ(cnpj); err != nil {
		return nil, err
	}
	updated := &Sponsor{
		Name:    req.Name,
		Website: req.Website,
		Logo:    logo,
	}
	if err := s.repo.Update(cnpj, updated); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Patrocinador não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar patrocinador", err)
	}
	return s.GetSponsorByCNPJ(cnpj)
}

func (s *sponsorService) DeleteSponsor(cnpj string) error {
	err := s.repo.Delete(cnpj)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Patrocinador não encontrado", err)
		}
		return apierrors.InternalServerError("Erro ao deletar patrocinador", err)
	}
	return nil
}

func (s *sponsorService) RecordClick(cnpj string) (*Sponsor, error) {
	sp, err := s.GetSponsorByCNPJ(cnpj)
	if err != nil {
		return nil, err
	}
	if err := s.repo.IncrementClicks(cnpj); err != nil {
		return nil, apierrors.InternalServerError("Erro ao registrar clique", err)
	}
	return sp, nil
}

func (s *sponsorService) GetPackages(cnpj string, year int) ([]SponsorPackage, error) {
	if _, err := s.GetSponsorByCNPJ(cnpj); err != nil {
		return nil, err
	}
	pkgs, err := s.repo.GetPackages(cnpj, year)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar pacotes", err)
	}
	return pkgs, nil
}

func (s *sponsorService) AddPackage(cnpj string, req AddPackageRequest) (*SponsorPackage, error) {
	if _, err := s.GetSponsorByCNPJ(cnpj); err != nil {
		return nil, err
	}
	pkg := &SponsorPackage{
		SponsorCNPJ: cnpj,
		Year:        req.Year,
		Package:     strings.TrimSpace(req.Package),
	}
	if err := s.repo.AddPackage(pkg); err != nil {
		return nil, apierrors.InternalServerError("Erro ao adicionar pacote", err)
	}
	return pkg, nil
}

func (s *sponsorService) RemovePackage(cnpj string, year int, packageName string) error {
	err := s.repo.RemovePackage(cnpj, year, packageName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Pacote não encontrado", err)
		}
		return apierrors.InternalServerError("Erro ao remover pacote", err)
	}
	return nil
}

func (s *sponsorService) GetSponsors(page, limit int, sortBy, sortOrder, searchBy, searchValue string) (*SponsorListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}
	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
	}
	if sortBy == "" {
		sortBy = "name"
	}
	if sortOrder == "" {
		sortOrder = "asc"
	}
	return s.repo.GetAll(SponsorListQuery{
		Limit:       limit,
		Offset:      (page - 1) * limit,
		SortBy:      strings.ToLower(sortBy),
		SortOrder:   strings.ToLower(sortOrder),
		SearchBy:    strings.ToLower(searchBy),
		SearchValue: searchValue,
	})
}
