package sales

import (
	"backend/internal/product"
	"backend/internal/user"
	"time"
)

type SaleStatus string

const (
	SaleStatusPending  SaleStatus = "PENDING"
	SaleStatusPaid     SaleStatus = "PAID"
	SaleStatusCanceled SaleStatus = "CANCELED"
	SaleStatusRefunded SaleStatus = "REFUNDED"
)

// Sale é a entidade principal da venda
type Sale struct {
	ID             uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleUserNumber uint       `gorm:"column:user_number;not null" json:"user_number"`
	Status         SaleStatus `gorm:"size:20;not null;default:'PENDING'" json:"status"`
	TotalAmount    float64    `gorm:"not null" json:"total_amount"`
	PaymentMethod  string     `gorm:"size:50;not null" json:"payment_method"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User  *user.User `gorm:"foreignKey:SaleUserNumber;references:UserNumber;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"user,omitempty"`
	Items []SaleItem `gorm:"foreignKey:SaleID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}

// SaleItem representa os produtos da compra com preço imutável
type SaleItem struct {
	ID         uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleID     uint    `gorm:"not null" json:"sale_id"`
	ProductID  uint    `gorm:"not null" json:"product_id"`
	Quantity   int     `gorm:"not null;default:1" json:"quantity"`
	UnitPrice  float64 `gorm:"not null" json:"unit_price"`
	
	// Indica se o item (ex: KIT / Camiseta) já foi retirado presencialmente
	IsPickedUp bool    `gorm:"not null;default:false" json:"is_picked_up"`

	Product *product.Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// DTOs de Requisição ---------

type CreateSaleItemRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type CreateSaleRequest struct {
	PaymentMethod string                  `json:"payment_method" binding:"required,max=50"`
	Items         []CreateSaleItemRequest `json:"items" binding:"required,min=1,dive"`
	Status        SaleStatus `json:"status" binding:"omitempty,oneof=PENDING PAID CANCELED REFUNDED"`
}

type UpdateSaleRequest struct {
	Status        SaleStatus `json:"status" binding:"omitempty,oneof=PENDING PAID CANCELED REFUNDED"`
	PaymentMethod string     `json:"payment_method" binding:"omitempty,max=50"`
}

// UpdateSaleItemPickupRequest é utilizado pelo admin para marcar a camiseta/kit como retirada
type UpdateSaleItemPickupRequest struct {
	IsPickedUp bool `json:"is_picked_up"`
}

// DTOs de Listagem ---------

type SaleListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type SaleListResult struct {
	Sales           []Sale `json:"sales"`
	TotalRecords    int64  `json:"total_records"`
	FilteredRecords int64  `json:"filtered_records"`
}