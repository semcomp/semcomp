package sales

import (
	"backend/internal/product"
	"backend/internal/payment"
)

// SaleStatus define os possíveis estados de uma venda
type SaleStatus string


// Sale representa o cabeçalho da venda (pedido)
type Sale struct {
	ID            	uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	Customer	 	string     `gorm:"size:255" json:"customer_email"`	
	TotalAmount   	float64    `gorm:"not null" json:"total_amount"` // Soma do (Preço Unitário * Quantidade) de todos os itens
	
	// Relacionamentos
	Items []SaleItem `gorm:"foreignKey:SaleID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
	Payment       	payment.Payment `gorm:"foreignKey:ID_Payment" json:"payment,omitempty"`
}

// SaleItem representa a relação entre a Venda e o Produto (itens do carrinho)
type SaleItem struct {
	ID        uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleID    uint    `gorm:"not null" json:"sale_id"`
	ProductID uint    `gorm:"not null" json:"product_id"`
	Quantity  int     `gorm:"not null;default:1" json:"quantity"`
	
	// CRÍTICO: Salvar o preço no momento da venda. 
	// Se o preço do produto mudar no futuro, o histórico da venda não é afetado.
	UnitPrice float64 `gorm:"not null" json:"unit_price"` 

	// Relacionamento (belongs-to) para carregar os dados do produto quando necessário
	Product product.Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// DTOs de Requisição ---------

// CreateSaleRequest é o payload que seu frontend enviará para criar uma venda
type CreateSaleRequest struct {
	Customer	 	string                  `json:"customer_email" binding:"omitempty,email,max=255"`
	Items         	[]CreateSaleItemRequest `json:"items" binding:"required,min=1,dive"`
}

// CreateSaleItemRequest são os itens enviados no momento da compra
type CreateSaleItemRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}