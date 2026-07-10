package payment

import "time"

type Payment struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserNumber    uint      `gorm:"not null;index" json:"user_number"`
	MercadoPagoID string    `gorm:"size:100;unique;not null" json:"mercadopago_id"`
	Status        string    `gorm:"size:50;not null" json:"status"` // pending, approved, rejected
	Amount        float64   `gorm:"not null" json:"amount"`
	Description   string    `gorm:"type:text" json:"description"`
	ExternalRef   string    `gorm:"size:200" json:"external_ref"` // sua referência interna
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type CreatePaymentRequest struct {
	UserNumber  uint    `json:"user_number" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	Description string  `json:"description"`
}

type WebhookPayload struct {
	Action string `json:"action"`
	Data   struct {
		ID string `json:"id"`
	} `json:"data"`
}
