// model de sale atualizado para centralizar algumas lógicas da relação entre payment e sale
// adicionei alguns comentários a respeito de "TODOs" com ajuda de IA para o que deve ser alterado nos outros códigos

package sales

import (
	"backend/internal/product"
	"backend/internal/user"
	"time"
)

type SaleStatus string

const (
	SaleStatusPending  SaleStatus = "PENDENTE"
	SaleStatusPaid     SaleStatus = "PAGO"
	SaleStatusCanceled SaleStatus = "CANCELADO"
	SaleStatusRefunded SaleStatus = "REEMBOLSADO"
)

// Sale é a entidade principal da venda
type Sale struct {
	ID             uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleUserNumber uint       `gorm:"column:user_number;not null" json:"user_number"`
	Status         SaleStatus `gorm:"size:20;not null;default:'PENDENTE'" json:"status"`
	TotalAmount    float64 `gorm:"not null" json:"total_amount"`

	// Remoção: PaymentMethod migrado para Payment.Method
	// O método de pagamento é um atributo do pagamento, não do pedido
	// TODO: service.go (CreateSale) deve remover a atribuição de PaymentMethod
	// TODO: service.go (UpdateSaleByID) deve remover o bloco que atualiza payment_method
	// TODO: repository.go (applySaleSearchFilter) deve remover o case "payment_method"
	// Código anterior:
	//   PaymentMethod string `gorm:"size:50;not null" json:"payment_method"`

	// DietaryRestrictions guarda as restrições alimentares informadas para o pedido
	// Só faz sentido para vendas que envolvam produtos do tipo COFFEE (direto ou por COMBO)
	DietaryRestrictions string `gorm:"size:1000" json:"dietary_restrictions"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User  *user.User `gorm:"foreignKey:SaleUserNumber;references:UserNumber;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"user,omitempty"`
	Items []SaleItem `gorm:"foreignKey:SaleID;references:ID;constraint:OnDelete:CASCADE" json:"items,omitempty"`

	// Campos calculados (não persistidos): indicam se a venda envolve produtos do tipo
	// KIT e/ou COFFEE, considerando também itens dentro de um COMBO. Preenchidos por
	// ComputeItemFlags() após o carregamento de Items/Product (e ComboItems, se houver).
	HasKitItems    bool `gorm:"-" json:"has_kit_items"`
	HasCoffeeItems bool `gorm:"-" json:"has_coffee_items"`
}

// ComputeItemFlags analisa os itens da venda (incluindo produtos do tipo COMBO, olhando
// seus ComboItems) e preenche HasKitItems / HasCoffeeItems.
//
// Requer que Items, Items.Product e, quando o item for um COMBO,
// Items.Product.ComboItems.Item já estejam carregados (via Preload no repositório).
func (s *Sale) ComputeItemFlags() {
	hasKit := false
	hasCoffee := false

	for _, item := range s.Items {
		if item.Product == nil {
			continue
		}

		switch item.Product.Type {
		case product.ProductTypeKit:
			hasKit = true
		case product.ProductTypeCoffee:
			hasCoffee = true
		case product.ProductTypeCombo:
			for _, comboItem := range item.Product.ComboItems {
				if comboItem.Item == nil {
					continue
				}
				switch comboItem.Item.Type {
				case product.ProductTypeKit:
					hasKit = true
				case product.ProductTypeCoffee:
					hasCoffee = true
				}
			}
		}

		if hasKit && hasCoffee {
			break
		}
	}

	s.HasKitItems = hasKit
	s.HasCoffeeItems = hasCoffee
}

// SaleItem representa os produtos da compra com preço imutável
type SaleItem struct {
	ID         uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleID     uint    `gorm:"not null" json:"sale_id"`
	ProductID  uint    `gorm:"not null" json:"product_id"`
	Quantity   int     `gorm:"not null;default:1" json:"quantity"`
	UnitPrice  float64 `gorm:"not null" json:"unit_price"`

	// Indica se o item (ex: KIT / Camiseta) já foi retirado presencialmente
	IsPickedUp bool `gorm:"not null;default:false" json:"is_picked_up"`

	Product *product.Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// DTOs de Requisição ---------

type CreateSaleItemRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type CreateSaleRequest struct {
	Items               []CreateSaleItemRequest `json:"items" binding:"required,min=1,dive"`
	Status              SaleStatus              `json:"status" binding:"omitempty,oneof=PENDENTE PAGO CANCELADO REEMBOLSADO"`
	DietaryRestrictions string                  `json:"dietary_restrictions" binding:"omitempty,max=1000"`

	// Remoção: PaymentMethod migrado para CreatePixRequest.Method (em payment/models.go)
	// Código anterior:
	//   PaymentMethod string `json:"payment_method" binding:"required,max=50"`
}

type UpdateSaleRequest struct {
	Status              SaleStatus `json:"status" binding:"omitempty,oneof=PENDENTE PAGO CANCELADO REEMBOLSADO"`
	DietaryRestrictions string     `json:"dietary_restrictions" binding:"omitempty,max=1000"`

	// Remoção: PaymentMethod migrado para Payment.Method (em payment/models.go)
	// Código anterior:
	//   PaymentMethod string `json:"payment_method" binding:"omitempty,max=50"`
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