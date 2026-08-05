package sales

import (
	"errors"
	"fmt"
	"slices"
	"strings"

	"backend/internal/apierrors"
	"gorm.io/gorm"
)

type SaleRepository interface {
	Create(sale *Sale) error
	GetByID(id uint) (*Sale, error)
	GetByUserNumber(userNumber uint) ([]Sale, error)
	GetAll(query SaleListQuery) (*SaleListResult, error)
	UpdateByID(id uint, updateData map[string]interface{}) error
	DeleteByID(id uint) error
	
	// Operações de itens
	GetSaleItemByID(itemID uint) (*SaleItem, error)
	UpdateItemPickup(itemID uint, isPickedUp bool) error
}

type saleRepository struct {
	db *gorm.DB
}

func NewSaleRepository(db *gorm.DB) SaleRepository {
	return &saleRepository{db: db}
}

func (r *saleRepository) Create(sale *Sale) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return tx.Create(sale).Error
	})
}

func (r *saleRepository) GetByID(id uint) (*Sale, error) {
	var sale Sale
	err := r.db.
		Preload("User").
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Product.Kit").
		Preload("Items.Product.Coffee").
		Where("id = ?", id).
		First(&sale).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Venda não encontrada", err)
		}
		return nil, err
	}
	return &sale, nil
}

func (r *saleRepository) GetByUserNumber(userNumber uint) ([]Sale, error) {
	var sales []Sale
	err := r.db.
		Where("user_number = ?", userNumber).
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Product.Kit").
		Order("created_at desc").
		Find(&sales).Error

	return sales, err
}

func (r *saleRepository) UpdateByID(id uint, updateData map[string]interface{}) error {
	result := r.db.Model(&Sale{}).Where("id = ?", id).Updates(updateData)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *saleRepository) DeleteByID(id uint) error {
	result := r.db.Where("id = ?", id).Delete(&Sale{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func applySaleSearchFilter(dbQuery *gorm.DB, query SaleListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "status":
		return dbQuery.Where("status ILIKE ?", "%"+query.SearchValue+"%")
	case "payment_method":
		return dbQuery.Where("payment_method ILIKE ?", "%"+query.SearchValue+"%")
	case "user_number":
		return dbQuery.Where("user_number = ?", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveSaleSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{"id", "status", "total_amount", "created_at"}

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

func (r *saleRepository) GetAll(query SaleListQuery) (*SaleListResult, error) {
	var sales []Sale
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSaleSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Sale{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySaleSearchFilter(r.db.Model(&Sale{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySaleSearchFilter(r.db.Model(&Sale{}), query)
	err = dataQuery.
		Preload("User").
		Order(sortClause).
		Limit(query.Limit).
		Offset(query.Offset).
		Find(&sales).Error

	if err != nil {
		return nil, err
	}

	return &SaleListResult{
		Sales:           sales,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

// GetSaleItemByID busca um item específico da venda
func (r *saleRepository) GetSaleItemByID(itemID uint) (*SaleItem, error) {
	var item SaleItem
	err := r.db.Preload("Product").Preload("Product.Kit").Where("id = ?", itemID).First(&item).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Item da venda não encontrado", err)
		}
		return nil, err
	}
	return &item, nil
}

// UpdateItemPickup atualiza apenas o status de retirada do item
func (r *saleRepository) UpdateItemPickup(itemID uint, isPickedUp bool) error {
	result := r.db.Model(&SaleItem{}).Where("id = ?", itemID).Update("is_picked_up", isPickedUp)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}