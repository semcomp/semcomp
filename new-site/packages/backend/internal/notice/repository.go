package notice

import (
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

type NoticeRepository interface {
	Create(notice *Notice) error
	GetByID(id uint) (*Notice, error)
	DeleteByID(id uint) error
	UpdateByID(id uint, notice *Notice) error
	GetNotices(query NoticeListQuery) (*NoticeListResult, error)
}

type noticeRepository struct {
	db *gorm.DB
}

func NewNoticeRepository(db *gorm.DB) NoticeRepository {
	return &noticeRepository{db: db}
}

func (r *noticeRepository) Create(notice *Notice) error {
	return r.db.Create(notice).Error
}

func (r *noticeRepository) GetByID(id uint) (*Notice, error) {
	var notice Notice
	err := r.db.Where("id = ?", id).First(&notice).Error
	if err != nil {
		return nil, err
	}
	return &notice, nil
}

func (r *noticeRepository) DeleteByID(id uint) error {
	return r.db.Where("id = ?", id).Delete(&Notice{}).Error
}

func (r *noticeRepository) UpdateByID(id uint, notice *Notice) error {
	result := r.db.Model(&Notice{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"title":     notice.Title,
			"content":   notice.Content,
			"date_time": notice.DateTime,
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func applyNoticeSearchFilter(dbQuery *gorm.DB, query NoticeListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "id":
		return dbQuery.Where("id::text ILIKE ?", "%"+query.SearchValue+"%")
	case "title":
		return dbQuery.Where("title ILIKE ?", "%"+query.SearchValue+"%")
	case "content":
		return dbQuery.Where("content ILIKE ?", "%"+query.SearchValue+"%")
	case "date_time":
		return dbQuery.Where("date_time = ?", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveNoticeSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{"id", "title", "content", "date_time"}

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

func (r *noticeRepository) GetNotices(query NoticeListQuery) (*NoticeListResult, error) {
	var notices []Notice
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveNoticeSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Notice{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applyNoticeSearchFilter(r.db.Model(&Notice{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applyNoticeSearchFilter(r.db.Model(&Notice{}), query)
	err = dataQuery.
		Order(sortClause).
		Limit(query.Limit).
		Offset(query.Offset).
		Find(&notices).Error
	if err != nil {
		return nil, err
	}

	return &NoticeListResult{
		Notices:         notices,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}
