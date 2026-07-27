package sponsor

import (
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

type SponsorRepository interface {
	GetAll(query SponsorListQuery) (*SponsorListResult, error)
	GetPublic(year int) ([]Sponsor, error)
	GetByCNPJ(cnpj string) (*Sponsor, error)
	Create(sponsor *Sponsor) error
	Update(cnpj string, sponsor *Sponsor) error
	Delete(cnpj string) error
	IncrementClicks(cnpj string) error
	GetPackages(cnpj string, year int) ([]SponsorPackage, error)
	AddPackage(pkg *SponsorPackage) error
	RemovePackage(cnpj string, year int, packageName string) error
}

type sponsorRepository struct {
	db *gorm.DB
}

func NewSponsorRepository(db *gorm.DB) SponsorRepository {
	return &sponsorRepository{db: db}
}

func (r *sponsorRepository) GetPublic(year int) ([]Sponsor, error) {
	var sponsors []Sponsor
	err := r.db.
		Joins("JOIN sponsor_packages ON sponsor_packages.sponsor_cnpj = sponsors.cnpj AND sponsor_packages.year = ?", year).
		Distinct("sponsors.*").
		Find(&sponsors).Error
	return sponsors, err
}

func (r *sponsorRepository) GetByCNPJ(cnpj string) (*Sponsor, error) {
	var sponsor Sponsor
	err := r.db.Preload("Packages").Where("cnpj = ?", cnpj).First(&sponsor).Error
	if err != nil {
		return nil, err
	}
	return &sponsor, nil
}

func (r *sponsorRepository) Create(sponsor *Sponsor) error {
	return r.db.Create(sponsor).Error
}

func (r *sponsorRepository) Update(cnpj string, sponsor *Sponsor) error {
	result := r.db.Model(&Sponsor{}).Where("cnpj = ?", cnpj).Updates(map[string]interface{}{
		"name":    sponsor.Name,
		"website": sponsor.Website,
		"logo":    sponsor.Logo,
	})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *sponsorRepository) Delete(cnpj string) error {
	result := r.db.Where("cnpj = ?", cnpj).Delete(&Sponsor{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *sponsorRepository) IncrementClicks(cnpj string) error {
	result := r.db.Model(&Sponsor{}).Where("cnpj = ?", cnpj).UpdateColumn("clicks", gorm.Expr("clicks + 1"))
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *sponsorRepository) GetPackages(cnpj string, year int) ([]SponsorPackage, error) {
	var pkgs []SponsorPackage
	query := r.db.Where("sponsor_cnpj = ?", cnpj)
	if year != 0 {
		query = query.Where("year = ?", year)
	}
	err := query.Find(&pkgs).Error
	return pkgs, err
}

func (r *sponsorRepository) AddPackage(pkg *SponsorPackage) error {
	return r.db.Create(pkg).Error
}

func (r *sponsorRepository) RemovePackage(cnpj string, year int, packageName string) error {
	result := r.db.Where("sponsor_cnpj = ? AND year = ? AND package = ?", cnpj, year, packageName).Delete(&SponsorPackage{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func applySponsorSearchFilter(dbQuery *gorm.DB, query SponsorListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}
	switch query.SearchBy {
	case "name":
		return dbQuery.Where("name ILIKE ?", "%"+query.SearchValue+"%")
	case "cnpj":
		return dbQuery.Where("cnpj ILIKE ?", "%"+query.SearchValue+"%")
	case "website":
		return dbQuery.Where("website ILIKE ?", "%"+query.SearchValue+"%")
	default:
		return dbQuery
	}
}

func resolveSponsorSortClause(sortBy, sortOrder string) (string, error) {
	allowed := []string{"cnpj", "name", "website", "clicks"}
	field := strings.ToLower(sortBy)
	if !slices.Contains(allowed, field) {
		return "", fmt.Errorf("invalid sort field")
	}
	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}
	return field + " " + order, nil
}

func (r *sponsorRepository) GetAll(query SponsorListQuery) (*SponsorListResult, error) {
	var sponsors []Sponsor
	var totalRecords, filteredRecords int64

	sortClause, err := resolveSponsorSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Sponsor{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySponsorSearchFilter(r.db.Model(&Sponsor{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySponsorSearchFilter(r.db.Model(&Sponsor{}), query)
	err = dataQuery.
		Preload("Packages").
		Order(sortClause).
		Limit(query.Limit).
		Offset(query.Offset).
		Find(&sponsors).Error
	if err != nil {
		return nil, err
	}

	return &SponsorListResult{
		Sponsors:        sponsors,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}
