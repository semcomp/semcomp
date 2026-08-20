package sales

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"backend/internal/apierrors"
	"backend/internal/product"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SaleRepository interface {
	Create(sale *Sale) error
	GetByID(id uint) (*Sale, error)
	GetByUserNumber(userNumber uint) ([]Sale, error)
	GetAll(query SaleListQuery) (*SaleListResult, error)
	UpdateByID(id uint, updateData map[string]interface{}) error
	DeleteByID(id uint) error

	// SetMercadoPagoID grava o ID do pagamento do MP assim que ele é conhecido
	// (equivalente ao antigo PaymentRepository.SetMercadoPagoID).
	SetMercadoPagoID(id uint, mpID string) error

	// SetPixQRCode grava o QR code (copia-e-cola) e o QR code base64 de uma
	// venda PIX pendente — chamado após a cobrança ser criada no Mercado Pago
	// (ou no mock de dev MERCADOPAGO_MOCK).
	SetPixQRCode(id uint, qrCode, qrCodeBase64 string) error

	// Operações de itens
	GetSaleItemByID(itemID uint) (*SaleItem, error)
	UpdateItemPickup(itemID uint, isPickedUp bool) error

	// Compra única (consumido)
	// CreateWithConsumed cria a venda e insere as linhas de ConsumedItem dos
	// produtos de compra única (COFFEE/COMBO) na MESMA transação. Se uma linha
	// conflitar (usuário já tem o item consumido/reservado), a transação é
	// revertida e a venda não é criada.
	CreateWithConsumed(sale *Sale, consumedProductIDs []uint) error
	// UpsertConsumed insere linhas de ConsumedItem para uma venda JÁ EXISTENTE
	// (idempotente, OnConflict DoNothing). Usado pelo sync de consumo ao
	// re-travar após mudança de status.
	UpsertConsumed(userNumber uint, sourceSaleID uint, productIDs []uint) error
	DeleteConsumedBySale(sourceSaleID uint) error
	GetConsumedProductIDs(userNumber uint) ([]uint, error)
	// GetCoffeeIDsInCombos retorna os coffees (item_id) dentro dos combos dados.
	GetCoffeeIDsInCombos(comboIDs []uint) ([]uint, error)
	// GetComboIDsContainingCoffee retorna os combos que contêm os coffees dados.
	GetComboIDsContainingCoffee(coffeeIDs []uint) ([]uint, error)
	// ExpirePendingPixSales marca como EXPIRADO os PIX pendentes fora da janela
	// e retorna os ids das vendas expiradas (para o sweeper liberar as travas de
	// compra única). Atômico: o UPDATE ... RETURNING só atualiza linhas que ainda
	// casam o predicado no momento do update, evitando sobrescrever um PAGO
	// recém-chegado do webhook.
	ExpirePendingPixSales() ([]uint, error)
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
		Preload("Items.Product.ComboItems").
		Preload("Items.Product.ComboItems.Item").
		Preload("Items.Product.ComboItems.Item.Kit").
		Preload("Items.Product.ComboItems.Item.Coffee").
		Preload("Items.KitProduct").
		Preload("Items.KitProduct.Kit").
		Where("id = ?", id).
		First(&sale).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Venda não encontrada", err)
		}
		return nil, err
	}

	sale.ComputeItemFlags()
	return &sale, nil
}

func (r *saleRepository) GetByUserNumber(userNumber uint) ([]Sale, error) {
	var sales []Sale
	err := r.db.
		Where("sale_user_number = ?", userNumber).
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Product.Kit").
		Preload("Items.Product.Coffee").
		Preload("Items.Product.ComboItems").
		Preload("Items.Product.ComboItems.Item").
		Order("created_at desc").
		Find(&sales).Error

	if err != nil {
		return sales, err
	}

	for i := range sales {
		sales[i].ComputeItemFlags()
	}

	return sales, nil
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

// SetMercadoPagoID grava o ID do pagamento do MP assim que ele é conhecido.
func (r *saleRepository) SetMercadoPagoID(id uint, mpID string) error {
	result := r.db.
		Model(&Sale{}).
		Where("id = ?", id).
		Update("mercado_pago_id", mpID)
	if result.Error != nil {
		return apierrors.InternalServerError("Erro ao atualizar ID do pagamento", result.Error)
	}
	if result.RowsAffected == 0 {
		return apierrors.NotFoundError("Venda não encontrada", nil)
	}
	return nil
}

// SetPixQRCode grava o QR code (copia-e-cola) e o QR code base64 de uma venda.
func (r *saleRepository) SetPixQRCode(id uint, qrCode, qrCodeBase64 string) error {
	result := r.db.
		Model(&Sale{}).
		Where("id = ?", id).
		Update("qr_code", qrCode).
		Update("qr_code_base64", qrCodeBase64)
	if result.Error != nil {
		return apierrors.InternalServerError("Erro ao atualizar QR code do pagamento", result.Error)
	}
	if result.RowsAffected == 0 {
		return apierrors.NotFoundError("Venda não encontrada", nil)
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
		return dbQuery.Where("sale_user_number = ?", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveSaleSortClause(sortBy string, sortOrder string) (string, error) {
	// Mapeia o campo enviado pela API (json tag) para a coluna real do banco.
	// `user_number` (json) corresponde à coluna GORM `sale_user_number`.
	sortColumnMap := map[string]string{
		"id":             "id",
		"status":         "status",
		"total_amount":   "total_amount",
		"created_at":     "created_at",
		"user_number":    "sale_user_number",
		"payment_method": "payment_method",
	}

	field := strings.ToLower(sortBy)
	column, ok := sortColumnMap[field]
	if !ok {
		return "", fmt.Errorf("invalid sort field")
	}

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}

	return column + " " + order, nil
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
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Product.Kit").
		Preload("Items.Product.Coffee").
		Preload("Items.Product.ComboItems").
		Preload("Items.Product.ComboItems.Item").
		Preload("Items.Product.ComboItems.Item.Kit").
		Preload("Items.Product.ComboItems.Item.Coffee").
		Preload("Items.KitProduct").
		Preload("Items.KitProduct.Kit").
		Preload("User").
		Order(sortClause).
		Limit(query.Limit).
		Offset(query.Offset).
		Find(&sales).Error

	if err != nil {
		return nil, err
	}

	for i := range sales {
		sales[i].ComputeItemFlags()
	}

	return &SaleListResult{
		Sales:           sales,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

// GetSaleItemByID busca um item específico da venda.
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

// UpdateItemPickup atualiza apenas o status de retirada do item.
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

// CreateWithConsumed cria a venda e as travas de compra única na mesma
// transação. O OnConflict + RowsAffected converte a unicidade da chave composta
// (user_number, product_id) em rejeição do pedido: se um item já estiver
// consumido/reservado por outro pedido ativo, a venda inteira é revertida.
func (r *saleRepository) CreateWithConsumed(sale *Sale, consumedProductIDs []uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(sale).Error; err != nil {
			return err
		}

		for _, pid := range consumedProductIDs {
			item := ConsumedItem{
				UserNumber:   sale.SaleUserNumber,
				ProductID:    pid,
				SourceSaleID: sale.ID,
			}
			res := tx.Clauses(clause.OnConflict{
				Columns: []clause.Column{
					{Name: "user_number"},
					{Name: "product_id"},
				},
				DoNothing: true,
			}).Create(&item)
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return apierrors.ValidationError("Este item já foi consumido ou já está reservado em outro pedido", nil)
			}
		}
		return nil
	})
}

// UpsertConsumed insere linhas de ConsumedItem para uma venda já existente
// (idempotente: conflito na chave composta é ignorado). Diferente de
// CreateWithConsumed, não cria a venda nem rejeita o pedido — é usado pelo sync
// de consumo ao re-travar um pedido que passou para PAGO.
func (r *saleRepository) UpsertConsumed(userNumber uint, sourceSaleID uint, productIDs []uint) error {
	for _, pid := range productIDs {
		item := ConsumedItem{
			UserNumber:   userNumber,
			ProductID:    pid,
			SourceSaleID: sourceSaleID,
		}
		if err := r.db.Clauses(clause.OnConflict{
			Columns: []clause.Column{
				{Name: "user_number"},
				{Name: "product_id"},
			},
			DoNothing: true,
		}).Create(&item).Error; err != nil {
			return err
		}
	}
	return nil
}

// DeleteConsumedBySale remove as travas originadas por uma venda (usado ao
// expirar, cancelar ou reembolsar a venda).
func (r *saleRepository) DeleteConsumedBySale(sourceSaleID uint) error {
	return r.db.Where("source_sale_id = ?", sourceSaleID).Delete(&ConsumedItem{}).Error
}

// GetConsumedProductIDs retorna a base de ids consumidos do usuário (produtos
// COFFEE/COMBO que ele comprou ou tem em pedido ativo).
func (r *saleRepository) GetConsumedProductIDs(userNumber uint) ([]uint, error) {
	var ids []uint
	err := r.db.Model(&ConsumedItem{}).
		Where("user_number = ?", userNumber).
		Pluck("product_id", &ids).Error
	return ids, err
}

// GetCoffeeIDsInCombos retorna os ids dos produtos COFFEE dentro dos combos
// dados (só coffees propagam — kits não são consumidos).
func (r *saleRepository) GetCoffeeIDsInCombos(comboIDs []uint) ([]uint, error) {
	if len(comboIDs) == 0 {
		return nil, nil
	}
	var ids []uint
	err := r.db.Raw(`
		SELECT DISTINCT ci.item_id
		FROM combo_items ci
		JOIN products p ON p.id = ci.item_id
		WHERE ci.combo_id IN ? AND p.type = ?`,
		comboIDs, product.ProductTypeCoffee,
	).Scan(&ids).Error
	return ids, err
}

// GetComboIDsContainingCoffee retorna os combos que contêm os coffees dados.
// Combos não podem conter outros combos, então `item_id IN ?` só casa coffees.
func (r *saleRepository) GetComboIDsContainingCoffee(coffeeIDs []uint) ([]uint, error) {
	if len(coffeeIDs) == 0 {
		return nil, nil
	}
	var ids []uint
	err := r.db.Raw(`
		SELECT DISTINCT combo_id
		FROM combo_items
		WHERE item_id IN ?`,
		coffeeIDs,
	).Scan(&ids).Error
	return ids, err
}

// ExpirePendingPixSales persiste o status EXPIRADO nas cobranças PIX pendentes
// fora da janela de validade e retorna os ids das vendas expiradas. O
// UPDATE ... RETURNING é atômico: só atualiza linhas que casam o predicado no
// momento do update (um webhook que PAGUE a venda nesse intervalo não é
// sobrescrito para EXPIRADO).
func (r *saleRepository) ExpirePendingPixSales() ([]uint, error) {
	var ids []uint
	err := r.db.Raw(`
		UPDATE sales
		SET status = ?, updated_at = now()
		WHERE status = ? AND LOWER(payment_method) = ? AND created_at < ?
		RETURNING id`,
		SaleStatusExpired, SaleStatusPending, "pix", time.Now().Add(-PixExpirationWindow),
	).Scan(&ids).Error
	return ids, err
}