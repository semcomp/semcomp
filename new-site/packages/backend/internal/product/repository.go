package product

import (
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

type ProductRepository interface {
	Create(product *Product) error
	GetByID(id uint) (*Product, error)
	DeleteByID(id uint) error
	UpdateByID(id uint, product *Product) error
	GetProducts(query ProductListQuery) (*ProductListResult, error)
	CountComboItemRefs(itemID uint) (int64, error)
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Create(product *Product) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(product).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *productRepository) GetByID(id uint) (*Product, error) {
	var product Product
	err := r.db.
		Preload("Kit").
		Preload("Coffee").
		Preload("ComboItems.Item").
		Where("id = ?", id).
		First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) DeleteByID(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var product Product
		if err := tx.Where("id = ?", id).First(&product).Error; err != nil {
			return err
		}

		// Remove especializações associadas
		switch product.Type {
		case ProductTypeKit:
			tx.Where("id = ?", id).Delete(&Kit{})
		case ProductTypeCoffee:
			tx.Where("id = ?", id).Delete(&Coffee{})
		case ProductTypeCombo:
			tx.Where("combo_id = ?", id).Delete(&ComboItem{})
		}

		return tx.Delete(&product).Error
	})
}

func (r *productRepository) UpdateByID(id uint, product *Product) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Precisa saber o tipo ANTIGO antes de sobrescrever, para poder limpar
		// a especialização anterior caso o Type tenha mudado (ex: KIT -> COMBO).
		var current Product
		if err := tx.Where("id = ?", id).First(&current).Error; err != nil {
			return err
		}

		result := tx.Model(&Product{}).
			Where("id = ?", id).
			Updates(map[string]interface{}{
				"type":       product.Type,
				"is_selling": product.IsSelling,
				"price":      product.Price,
			})
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}

		// Tipo mudou: limpa a especialização antiga para não deixar dado órfão
		if current.Type != product.Type {
			switch current.Type {
			case ProductTypeKit:
				if err := tx.Where("id = ?", id).Delete(&Kit{}).Error; err != nil {
					return err
				}
			case ProductTypeCoffee:
				if err := tx.Where("id = ?", id).Delete(&Coffee{}).Error; err != nil {
					return err
				}
			case ProductTypeCombo:
				if err := tx.Where("combo_id = ?", id).Delete(&ComboItem{}).Error; err != nil {
					return err
				}
			}
		}

		// Atualiza especialização do tipo atual
		switch product.Type {
		case ProductTypeKit:
			if product.Kit != nil {
				product.Kit.ID = id
				if err := tx.Save(product.Kit).Error; err != nil {
					return err
				}
			}
		case ProductTypeCoffee:
			if product.Coffee != nil {
				product.Coffee.ID = id
				if err := tx.Save(product.Coffee).Error; err != nil {
					return err
				}
			}
		case ProductTypeCombo:
			// Remove itens antigos e insere os novos (substituição completa)
			if err := tx.Where("combo_id = ?", id).Delete(&ComboItem{}).Error; err != nil {
				return err
			}
			for i := range product.ComboItems {
				product.ComboItems[i].ComboID = id
				if err := tx.Create(&product.ComboItems[i]).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

// CountComboItemRefs conta quantos ComboItems referenciam o produto como item
func (r *productRepository) CountComboItemRefs(itemID uint) (int64, error) {
	var count int64
	err := r.db.Model(&ComboItem{}).Where("item_id = ?", itemID).Count(&count).Error
	return count, err
}

func applyProductSearchFilter(dbQuery *gorm.DB, query ProductListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "type":
		return dbQuery.Where("type ILIKE ?", "%"+query.SearchValue+"%")
	case "is_selling":
		return dbQuery.Where("is_selling = ?", strings.ToLower(query.SearchValue) == "true")
	case "price":
		return dbQuery.Where("price::text ILIKE ?", "%"+query.SearchValue+"%")
	default:
		return dbQuery
	}
}

func resolveProductSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{"id", "type", "is_selling", "price"}

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

func (r *productRepository) GetProducts(query ProductListQuery) (*ProductListResult, error) {
	var products []Product
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveProductSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&Product{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applyProductSearchFilter(r.db.Model(&Product{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applyProductSearchFilter(r.db.Model(&Product{}), query)
	err = dataQuery.
		Preload("Kit").
		Preload("Coffee").
		Preload("ComboItems.Item").
		Order(sortClause).
		Limit(query.Limit).
		Offset(query.Offset).
		Find(&products).Error
	if err != nil {
		return nil, err
	}

	return &ProductListResult{
		Products:        products,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}