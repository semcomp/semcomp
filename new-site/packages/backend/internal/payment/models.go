package payment

import (
	"time"
)

// 1. Tabelas Principais (Entidades)

type Payment struct {
	ID_Payment    uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserNumber    uint      `gorm:"not null;index" json:"user_number"`
	MercadoPagoID *string   `gorm:"size:100;unique;not null" json:"mercadopago_id"`
	Status        string    `gorm:"size:50;not null;check:status_chk,status IN ('pending', 'approved', 'rejected', 'refunded')" json:"status"`
	Amount        float64   `gorm:"not null" json:"amount"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Items         []Item    `gorm:"many2many:payment_items;joinForeignKey:ID_Payment;joinReferences:ID_Item" json:"items,omitempty"`
}

type Item struct {
	ID_Item    uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string  `gorm:"size:255;not null" json:"name"`
	PictureURL string  `gorm:"size:255;not null" json:"picture_url"`
	Type       string  `gorm:"size:50;not null;check:type_chk,type IN ('shirt', 'coffee', 'combo')" json:"type"`
	IsSelling  bool    `gorm:"not null" json:"is_selling"`
	Price      float64 `gorm:"not null" json:"price"`
}

type Shirt struct {
	ID_Item    uint   `gorm:"primaryKey" json:"id_item"` // PK e FK ao mesmo tempo
	Item       Item   `gorm:"foreignKey:ID_Item;references:ID_Item;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"item,omitempty"`
	Size       string `gorm:"size:2;not null;check:size_chk,size IN ('PP', 'P', 'M', 'G', 'GG')" json:"size"`
	IsBabydoll bool   `gorm:"not null" json:"babydoll"`
	Color      string `gorm:"size:50;not null" json:"color"`
}

type Coffee struct {
	ID_Item     uint      `gorm:"primaryKey" json:"id_item"` // PK e FK ao mesmo tempo
	Item        Item      `gorm:"foreignKey:ID_Item;references:ID_Item;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"item,omitempty"`
	DateAndHour time.Time `gorm:"not null" json:"date_and_hour"`
}

type Combo struct {
	ID_Item uint `gorm:"primaryKey" json:"id_item"` // PK e FK ao mesmo tempo
	Item    Item `gorm:"foreignKey:ID_Item;references:ID_Item;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"item,omitempty"`

	// Um Combo contém múltiplos Itens
	Items []Item `gorm:"many2many:combo_items;joinForeignKey:ID_Combo;joinReferences:ID_Item" json:"items,omitempty"`
}

// PaymentItem une um Pagamento a vários Itens
type PaymentItem struct {
	ID_Payment uint    `gorm:"primaryKey" json:"id_payment"`
	Payment    Payment `gorm:"foreignKey:ID_Payment;references:ID_Payment;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`

	ID_Item uint `gorm:"primaryKey" json:"id_item"`
	Item    Item `gorm:"foreignKey:ID_Item;references:ID_Item;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
}

// ComboItem une um Combo (que é um Item) aos Itens que fazem parte dele
type ComboItem struct {
	ID_Combo uint  `gorm:"primaryKey" json:"id_combo"`
	Combo    Combo `gorm:"foreignKey:ID_Combo;references:ID_Item;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`

	ID_Item uint `gorm:"primaryKey;check:id_item_chk,id_item<>id_combo" json:"id_item"`
	Item    Item `gorm:"foreignKey:ID_Item;references:ID_Item;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
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
