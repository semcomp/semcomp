package section

import (
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

type SectionRepository interface {
	Create(section *Section) error
	GetByName(name string) (*Section, error)
	DeleteByName(name string) error
	UpdateByName(name string, section *Section) error
	GetSections(query SectionListQuery) (*SectionListResult, error)
}

type sectionRepository struct {
	db *gorm.DB
}

func NewSectionRepository(db *gorm.DB) SectionRepository {
	return &sectionRepository{db: db}
}

func (r *sectionRepository) Create(section *Section) error {
	return r.db.Create(section).Error
}

func (r *sectionRepository) GetByName(name string) (*Section, error) {
	var section Section
	err := r.db.Where("name = ?", name).First(&section).Error
	if err != nil {
		return nil, err
	}
	return &section, nil
}

func (r *sectionRepository) DeleteByName(name string) error {
	result := r.db.Where("name = ?", name).Delete(&Section{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *sectionRepository) UpdateByName(name string, section *Section) error {
	result := r.db.Model(&Section{}).
		Where("name = ?", name).
		Updates(map[string]interface{}{
			"name":        section.Name,
			"description": section.Description,
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func applySectionSearchFilter(dbQuery *gorm.DB, query SectionListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}
	switch query.SearchBy {
	case "name":
		return dbQuery.Where("name ILIKE ?", "%"+query.SearchValue+"%")
	case "description":
		return dbQuery.Where("description ILIKE ?", "%"+query.SearchValue+"%")
	default:
		return dbQuery
	}
}

func resolveSectionSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{"name", "description"}

	field := strings.ToLower(sortBy)
	if !slices.Contains(allowedSortFields, field) {
		return "", fmt.Errorf("invalid sort field")
	}

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}

	return field + " " + order, nil
}

func (r *sectionRepository) GetSections(query SectionListQuery) (*SectionListResult, error) {
	var sections []Section
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSectionSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Section{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySectionSearchFilter(r.db.Model(&Section{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySectionSearchFilter(r.db.Model(&Section{}), query)
	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&sections).Error
	if err != nil {
		return nil, err
	}

	return &SectionListResult{
		Sections:        sections,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}
