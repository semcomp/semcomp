// model de payment atualizado para centralizar algumas lógicas da relação entre payment e sale
// adicionei alguns comentários a respeito de "TODOs" com ajuda de IA para o que deve ser alterado nos outros códigos

package payment

import (
	"time"
)

type Payment struct {
	// Alteração: ID_Payment renomeado para ID para padronizar com o restante do projeto
	// TODO: Todas as referências a ID_Payment em repository.go, service.go e handler.go precisam ser atualizadas para usar ID
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`

	// Adição: Vincula o pagamento a uma venda existente (Sale.ID)
	// Cada pagamento pertence a exatamente uma venda (1:1)
	// TODO: repository.go deve ganhar FindBySaleID(saleID uint).
	// TODO: service.go (CreatePix) deve receber sale_id e gravar aqui.
	// TODO: service.go (HandleWebhook) deve, ao receber status "approved", atualizar Sale.Status para "PAGO" via SaleRepository.
	SaleID uint `gorm:"not null;uniqueIndex" json:"sale_id"`

	UserNumber    uint    `gorm:"not null;index" json:"user_number"`
	MercadoPagoID *string `gorm:"size:100;uniqueIndex" json:"mercadopago_id"`
	Status        string  `gorm:"size:50;not null;check:status_chk,status IN ('pending', 'approved', 'rejected', 'refunded')" json:"status"`
	Amount        float64 `gorm:"not null" json:"amount"`

	// Adição: Método de pagamento (ex: "pix", "cartão").
	// Migrado de Sale.PaymentMethod para cá, pois é um atributo do ato do pagamento, não do pedido.
	// TODO: service.go (CreatePix) deve gravar req.Method aqui.
	Method string `gorm:"size:50;not null" json:"method"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Remoção: Associação many2many com produtos.
	// Os produtos já estão vinculados via Sale -> SaleItem, então essa relação era redundante.
	// TODO: repository.go deve remover SetProducts() e o import de "backend/internal/product".
	// TODO: service.go (CreatePix) deve remover a chamada a SetProducts().
	// Código anterior:
	//   Products []product.Product `gorm:"many2many:payment_products" json:"products,omitempty"`
}

type CreatePixRequest struct {
	// Adição: ID da venda à qual esse pagamento se refere
	// TODO: service.go deve buscar a Sale por esse ID para validar existência
	SaleID uint `json:"sale_id" binding:"required"`

	// Adição: Método de pagamento (ex: "pix")
	// TODO: service.go deve gravar esse valor em Payment.Method
	Method string `json:"method" binding:"required,max=50"`

	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Description string  `json:"description"`

	// Remoção: ProductIDs não é mais necessário porque os produtos estão em Sale (via SaleItem)
	// Código anterior:
	//   ProductIDs []uint `json:"product_ids"`
}

type PixPaymentResponse struct {
	PaymentID      uint      `json:"payment_id"`
	QRCode         string    `json:"qr_code"`
	QRCodeBase64   string    `json:"qr_code_base64"`
	Amount         float64   `json:"amount"`
	ExpirationDate time.Time `json:"expiration_date"`
}

type WebhookPayload struct {
	Action string `json:"action"`
	Data   struct {
		ID string `json:"id"`
	} `json:"data"`
}
