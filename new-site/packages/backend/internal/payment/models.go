package payment

import (
	"backend/internal/product"
	"time"
)

type Payment struct {
	ID_Payment    uint               `gorm:"primaryKey;autoIncrement" json:"id"`
	UserNumber    uint               `gorm:"not null;index" json:"user_number"`
	MercadoPagoID *string            `gorm:"size:100;uniqueIndex" json:"mercadopago_id"`
	Status        string             `gorm:"size:50;not null;check:status_chk,status IN ('pending', 'approved', 'rejected', 'refunded')" json:"status"`
	Amount        float64            `gorm:"not null" json:"amount"`
	CreatedAt     time.Time          `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time          `gorm:"autoUpdateTime" json:"updated_at"`
	Products      []product.Product  `gorm:"many2many:payment_products" json:"products,omitempty"`
}

type CreatePixRequest struct {
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Description string  `json:"description"`
	ProductIDs  []uint  `json:"product_ids"`
}

type PixPaymentResponse struct {
	PaymentID    uint    `json:"payment_id"`
	QRCode       string  `json:"qr_code"`
	QRCodeBase64 string  `json:"qr_code_base64"`
	Amount       float64 `json:"amount"`
}

type WebhookPayload struct {
	Action string `json:"action"`
	Data   struct {
		ID string `json:"id"`
	} `json:"data"`
}
