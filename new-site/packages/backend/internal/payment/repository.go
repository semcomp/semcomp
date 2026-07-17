package payment

import (
	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type PaymentRepository interface {
	Create(payment *Payment) error
	FindByID(id uint) (*Payment, error)
	FindByUser(userNumber uint) ([]Payment, error)
	FindByMercadoPagoID(mpID string) (*Payment, error)
	SetMercadoPagoID(id uint, mpID string) error
	UpdateStatus(id uint, status string) error
	Delete(id uint) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *paymentRepository) Create(payment *Payment) error {
	return r.db.Create(payment).Error
}

func (r *paymentRepository) FindByID(id uint) (*Payment, error) {
	var payment Payment
	err := r.db.First(&payment, id).Error
	if err != nil {
		return nil, apierrors.NotFoundError("Compra não encontrada", err)
	}
	return &payment, nil
}

func (r *paymentRepository) FindByUser(userNumber uint) ([]Payment, error) {
	var payments []Payment
	err := r.db.
		Where("user_number = ?", userNumber).
		Order("created_at desc").
		Find(&payments).Error
	return payments, apierrors.NotFoundError("Compras não encontradas", err)
}

func (r *paymentRepository) FindByMercadoPagoID(mpID string) (*Payment, error) {
	var payment Payment
	err := r.db.
		Where("mercado_pago_id = ?", mpID).
		First(&payment).Error
	if err != nil {
		return nil, apierrors.NotFoundError("Compra não encontrada", err)
	}
	return &payment, nil
}

// SetMercadoPagoID grava o ID do pagamento do MP assim que ele é conhecido
func (r *paymentRepository) SetMercadoPagoID(id uint, mpID string) error {
	result := r.db.
		Model(&Payment{}).
		Where("id_payment = ?", id).
		Update("mercado_pago_id", mpID)
	if result.Error != nil {
		return apierrors.InternalServerError("Erro ao atualizar ID da compra", result.Error)
	}
	if result.RowsAffected == 0 {
		return apierrors.NotFoundError("Compra não encontrada", nil)
	}
	return nil
}

// UpdateStatus agora atualiza por ID interno
func (r *paymentRepository) UpdateStatus(id uint, status string) error {
	result := r.db.
		Model(&Payment{}).
		Where("id_payment = ?", id).
		Update("status", status)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return apierrors.NotFoundError("Compra não encontrada", nil)
	}
	return nil
}

func (r *paymentRepository) Delete(id uint) error {
	return r.db.Delete(&Payment{}, id).Error
}
