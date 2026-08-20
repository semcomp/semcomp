package sales

import (
	"strings"
	"time"

	"backend/internal/product"
	"backend/internal/user"
)

type SaleStatus string

const (
	SaleStatusPending  SaleStatus = "PENDENTE"
	SaleStatusPaid     SaleStatus = "PAGO"
	SaleStatusRejected SaleStatus = "REJEITADO"
	SaleStatusCanceled SaleStatus = "CANCELADO"
	SaleStatusRefunded SaleStatus = "REEMBOLSADO"
	// SaleStatusExpired é persistido pelo sweeper de expiração; antes era apenas
	// calculado em memória por EffectiveStatus.
	SaleStatusExpired SaleStatus = "EXPIRADO"
)

// PixExpirationWindow é o tempo de validade de uma cobrança PIX pendente.
const PixExpirationWindow = 30 * time.Minute

// Sale é a entidade representativa de vendas e pagamentos
type Sale struct {
	ID            uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleUserNumber    uint       `gorm:"not null;index" json:"user_number"`
	Status        SaleStatus `gorm:"size:20;not null;default:'PENDENTE';check:status_chk,status IN ('PENDENTE','PAGO','REJEITADO','CANCELADO','REEMBOLSADO','EXPIRADO')" json:"status"`
	TotalAmount   float64    `gorm:"not null" json:"total_amount"`
	PaymentMethod string     `gorm:"size:50;not null" json:"payment_method"`

	// MercadoPagoID substitui a antiga tabela `payments`: só é preenchido
	// quando PaymentMethod == "pix" (ou outro método processado via MP).
	MercadoPagoID *string `gorm:"size:100;uniqueIndex" json:"mercadopago_id,omitempty"`

	// DietaryRestrictions só faz sentido para vendas com produtos do tipo
	// COFFEE (direto ou via COMBO).
	DietaryRestrictions string `gorm:"size:1000" json:"dietary_restrictions"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User  *user.User `gorm:"foreignKey:SaleUserNumber;references:UserNumber;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"user,omitempty"`
	Items []SaleItem `gorm:"foreignKey:SaleID;references:ID;constraint:OnDelete:CASCADE" json:"items,omitempty"`

	// Campos calculados (não persistidos): indicam se a venda envolve produtos
	// do tipo KIT e/ou COFFEE, considerando também itens dentro de um COMBO.
	// Preenchidos por ComputeItemFlags() após o carregamento de Items/Product.
	HasKitItems    bool `gorm:"-" json:"has_kit_items"`
	HasCoffeeItems bool `gorm:"-" json:"has_coffee_items"`

	// Campos transitórios (não persistidos), preenchidos apenas na resposta de
	// criação de uma cobrança PIX. Substituem o antigo DTO PixPaymentResponse.
	QRCode        string     `gorm:"-" json:"qr_code,omitempty"`
	QRCodeBase64  string     `gorm:"-" json:"qr_code_base64,omitempty"`
	PixExpiration *time.Time `gorm:"-" json:"pix_expiration,omitempty"`
}

// ComputeItemFlags analisa os itens da venda (incluindo produtos do tipo COMBO,
// olhando seus ComboItems) e preenche HasKitItems / HasCoffeeItems.
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

// EffectiveStatus retorna o status considerando a expiração de cobranças PIX
// pendentes (equivalente ao antigo PaymentService.GetStatus). Não altera o
// status persistido — só o webhook do Mercado Pago e o sweeper de expiração
// fazem isso.
func (s *Sale) EffectiveStatus() SaleStatus {
	if s.Status == SaleStatusPending &&
		strings.EqualFold(s.PaymentMethod, "pix") &&
		time.Since(s.CreatedAt) > PixExpirationWindow {
		return "EXPIRADO"
	}
	return s.Status
}

// SaleItem representa os produtos da compra com preço imutável.
type SaleItem struct {
	ID        uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleID    uint    `gorm:"not null" json:"sale_id"`
	ProductID uint    `gorm:"not null" json:"product_id"`
	Quantity  int     `gorm:"not null;default:1" json:"quantity"`
	UnitPrice float64 `gorm:"not null" json:"unit_price"`

	// Indica se o item (ex: KIT / Camiseta) já foi retirado presencialmente.
	IsPickedUp bool `gorm:"not null;default:false" json:"is_picked_up"`

	// KitProductID registra qual variante de KIT (tamanho/cor) o usuário escolheu
	// quando o ProductID é um COMBO. Nullable: nulo para KITs e COFFEEs avulsos.
	KitProductID *uint `gorm:"index" json:"kit_product_id,omitempty"`

	Product    *product.Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	KitProduct *product.Product `gorm:"foreignKey:KitProductID" json:"kit_product,omitempty"`
}

// ConsumedItem representa um produto de compra única (COFFEE ou COMBO) já
// consumido por um usuário. É a trava "só compra uma vez": enquanto existir
// uma linha aqui com um pedido ativo (PENDENTE não expirado ou PAGO), o item
// fica indisponível para o usuário. A linha é inserida junto com a criação do
// pedido (mesma transação) e removida quando o pedido expira, é cancelado ou
// reembolsado. A chave composta (user_number, product_id) também serve de
// trava anti-race para pedidos concorrentes do mesmo item.
type ConsumedItem struct {
	UserNumber uint `gorm:"primaryKey" json:"user_number"`
	ProductID  uint `gorm:"primaryKey" json:"product_id"`

	// SourceSaleID identifica o pedido que originou o consumo (usado para
	// destravar ao expirar/cancelar/reembolsar).
	SourceSaleID uint `gorm:"not null;index" json:"source_sale_id"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	Product *product.Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// DTOs de Requisição ---------

type CreateSaleItemRequest struct {
	ProductID    uint  `json:"product_id" binding:"required"`
	Quantity     int   `json:"quantity" binding:"required,min=1"`
	// KitProductID é obrigatório quando ProductID refere um COMBO: indica qual
	// variante de KIT (tamanho/cor/corte) o usuário selecionou dentro do combo.
	KitProductID *uint `json:"kit_product_id"`
}

// CreateSaleRequest cria um pedido e, quando PaymentMethod == "pix", também
// dispara a cobrança no Mercado Pago (unifica o antigo CreateSaleRequest com
// o antigo CreatePixRequest — Amount e ProductIDs deixam de existir por serem
// redundantes com Items, que já carregam produto + quantidade).
type CreateSaleRequest struct {
	PaymentMethod       string                  `json:"payment_method" binding:"required,max=50"`
	Items               []CreateSaleItemRequest `json:"items" binding:"required,min=1,dive"`
	Status              SaleStatus              `json:"status" binding:"omitempty,oneof=PENDENTE PAGO REJEITADO CANCELADO REEMBOLSADO"`
	DietaryRestrictions string                  `json:"dietary_restrictions" binding:"omitempty,max=1000"`
	// Description é opcional e usada apenas na descrição da cobrança PIX no Mercado Pago.
	Description string `json:"description" binding:"omitempty,max=255"`
}

type UpdateSaleRequest struct {
	Status              SaleStatus `json:"status" binding:"omitempty,oneof=PENDENTE PAGO REJEITADO CANCELADO REEMBOLSADO"`
	PaymentMethod       string     `json:"payment_method" binding:"omitempty,max=50"`
	// Ponteiro para distinguir "não enviado" (nil → não altera) de "enviado vazio"
	// (ptr para "" → limpa o campo no banco).
	DietaryRestrictions *string `json:"dietary_restrictions" binding:"omitempty,max=1000"`
}

// UpdateSaleItemPickupRequest é utilizado pelo admin para marcar a camiseta/kit como retirada.
type UpdateSaleItemPickupRequest struct {
	IsPickedUp bool `json:"is_picked_up"`
}

// WebhookPayload é o corpo enviado pelo Mercado Pago nas notificações de pagamento.
type WebhookPayload struct {
	Action string `json:"action"`
	Data   struct {
		ID string `json:"id"`
	} `json:"data"`
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