package product

import "time"

type ProductType string

const (
	ProductTypeKit   ProductType = "KIT"
	ProductTypeCoffee ProductType = "COFFEE"
	ProductTypeCombo ProductType = "COMBO"
)

// Product é a entidade base de um produto
type Product struct {
	ID        uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	Type      ProductType `gorm:"size:10;not null" json:"type"`
	IsSelling bool        `gorm:"not null" json:"is_selling"`
	Price     float64     `gorm:"not null" json:"price"`

	// Relacionamentos (preload)
	// li que é uma boa prática usar isso aqui
	Kit        *Kit        `gorm:"foreignKey:ID;constraint:OnDelete:CASCADE" json:"kit,omitempty"`
	Coffee     *Coffee     `gorm:"foreignKey:ID;constraint:OnDelete:CASCADE" json:"coffee,omitempty"`
	ComboItems []ComboItem `gorm:"foreignKey:ComboID;constraint:OnDelete:CASCADE" json:"combo_items,omitempty"`
}

// Kit é uma especialização de Product (tipo KIT)
// TODO: verificar se a camiseta vai ser vendida unicamente com o kit ou também avulsa
// (no segundo caso, acho que seria válido ter uma struct para camiseta também)
type Kit struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	Name       string `gorm:"size:200;not null" json:"name"`
	Size       string `gorm:"size:50;not null" json:"size"`
	Color      string `gorm:"size:50;not null" json:"color"`
	IsBabydoll bool   `gorm:"not null" json:"is_babydoll"`
}

// Coffee é uma especialização de Product (tipo COFFEE)
type Coffee struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	Name     string    `gorm:"size:200;not null" json:"name"`
	DateTime time.Time `gorm:"type:timestamptz;not null" json:"date_time"`
}

// ComboItem representa a relação N:M entre um combo e seus itens
type ComboItem struct {
	ComboID uint `gorm:"primaryKey;not null" json:"combo_id"`
	ItemID  uint `gorm:"primaryKey;not null" json:"item_id"`
}

// DTOs de Requisição ---------

type CreateKitRequest struct {
	Name       string `json:"name" binding:"required,max=200"`
	Size       string `json:"size" binding:"required,max=50"`
	Color      string `json:"color" binding:"required,max=50"`
	IsBabydoll bool   `json:"is_babydoll"`
}

type CreateCoffeeRequest struct {
	Name     string    `json:"name" binding:"required,max=200"`
	DateTime time.Time `json:"date_time" binding:"required"`
}

type CreateProductRequest struct {
	Type      ProductType          `json:"type" binding:"required,oneof=KIT COFFEE COMBO"`
	IsSelling bool                 `json:"is_selling"`
	Price     float64              `json:"price" binding:"required,gt=0"`
	Kit       *CreateKitRequest    `json:"kit,omitempty"`
	Coffee    *CreateCoffeeRequest `json:"coffee,omitempty"`
	Items     []uint               `json:"items,omitempty"`
}

type UpdateKitRequest struct {
	Name       string `json:"name" binding:"required,max=200"`
	Size       string `json:"size" binding:"required,max=50"`
	Color      string `json:"color" binding:"required,max=50"`
	IsBabydoll bool   `json:"is_babydoll"`
}

type UpdateCoffeeRequest struct {
	Name     string    `json:"name" binding:"required,max=200"`
	DateTime time.Time `json:"date_time" binding:"required"`
}

type UpdateProductRequest struct {
	Type      ProductType          `json:"type" binding:"required,oneof=KIT COFFEE COMBO"`
	IsSelling bool                 `json:"is_selling"`
	Price     float64              `json:"price" binding:"required,gt=0"`
	Kit       *UpdateKitRequest    `json:"kit,omitempty"`
	Coffee    *UpdateCoffeeRequest `json:"coffee,omitempty"`
	Items     []uint               `json:"items,omitempty"`
}

// DTOs de Listagem ---------

type ProductListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type ProductListResult struct {
	Products        []Product `json:"products"`
	TotalRecords    int64     `json:"total_records"`
	FilteredRecords int64     `json:"filtered_records"`
}
