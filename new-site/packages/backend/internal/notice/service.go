package notice

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type NoticeService interface {
	CreateNotice(request CreateNoticeRequest) (*Notice, error)
	GetNoticeByID(id string) (*Notice, error)
	DeleteNoticeByID(id string) error
	UpdateNoticeByID(id string, request UpdateNoticeRequest) (*Notice, error)
	GetNotices(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*NoticeListResult, error)
}

type noticeService struct {
	repo NoticeRepository
}

func NewNoticeService(repo NoticeRepository) NoticeService {
	return &noticeService{repo: repo}
}

func (s *noticeService) CreateNotice(request CreateNoticeRequest) (*Notice, error) {
	notice := Notice{
		Title:    request.Title,
		Content:  request.Content,
		DateTime: request.DateTime,
	}

	if err := s.repo.Create(&notice); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar aviso", err)
	}

	return &notice, nil
}

func (s *noticeService) GetNoticeByID(id string) (*Notice, error) {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("Parâmetro 'id' inválido", err)
	}

	notice, err := s.repo.GetByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Aviso não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro interno do servidor", err)
	}
	return notice, nil
}

func (s *noticeService) DeleteNoticeByID(id string) error {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return apierrors.ValidationError("Parâmetro 'id' inválido", err)
	}

	// Verifica se existe
	_, err = s.repo.GetByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Aviso não encontrado", err)
		}
		return apierrors.InternalServerError("Erro interno do servidor", err)
	}

	err = s.repo.DeleteByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Aviso não encontrado", err)
		}
		return apierrors.InternalServerError("Erro interno do servidor", err)
	}
	return nil
}

func (s *noticeService) UpdateNoticeByID(id string, request UpdateNoticeRequest) (*Notice, error) {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("Parâmetro 'id' inválido", err)
	}

	// Verifica se existe
	_, err = s.repo.GetByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Aviso não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro interno do servidor", err)
	}

	notice := Notice{
		Title:    request.Title,
		Content:  request.Content,
		DateTime: request.DateTime,
	}

	err = s.repo.UpdateByID(uint(parsedID), &notice)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Aviso não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro interno do servidor", err)
	}

	updated, err := s.repo.GetByID(uint(parsedID))
	if err != nil {
		return nil, apierrors.InternalServerError("Erro interno do servidor", err)
	}

	return updated, nil
}

func (s *noticeService) GetNotices(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*NoticeListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Parâmetro 'page' inválido", nil)
	}
	if limit < 1 {
		return nil, apierrors.ValidationError("Parâmetro 'limit' inválido", nil)
	}

	if sortBy == "" {
		sortBy = "date_time"
	}
	if sortOrder == "" {
		sortOrder = "desc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"id":        true,
		"title":     true,
		"content":   true,
		"date_time": true,
	}
	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("invalid sort_by parameter", nil)
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("invalid sort_order parameter", nil)
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("search_by and search_value must be provided together", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)
		allowedSearchFields := map[string]bool{
			"id":        true,
			"title":     true,
			"content":   true,
			"date_time": true,
		}
		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("invalid search_by parameter", nil)
		}

		if searchBy == "date_time" {
			_, err := time.Parse(time.RFC3339, searchValue)
			if err != nil {
				return nil, apierrors.ValidationError("invalid search_value for date_time, use RFC3339", err)
			}
		}
	}

	offset := (page - 1) * limit
	query := NoticeListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetNotices(query)
}
