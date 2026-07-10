package payment

import "gorm.io/gorm"

type PaymentRepository interface {
	Create(payment *Payment) error
	FindByUser(userNumber uint) ([]Payment, error)
	FindByMercadoPagoID(mpID string) (*Payment, error)
	UpdateStatus(mpID string, status string) error
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

func (r *paymentRepository) FindByUser(userNumber uint) ([]Payment, error) {
	var payments []Payment
	err := r.db.
		Where("user_number = ?", userNumber).
		Order("created_at desc").
		Find(&payments).Error
	return payments, err
}

func (r *paymentRepository) FindByMercadoPagoID(mpID string) (*Payment, error) {
	var payment Payment
	err := r.db.
		Where("mercado_pago_id = ?", mpID).
		First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

func (r *paymentRepository) UpdateStatus(mpID string, status string) error {
	return r.db.
		Model(&Payment{}).
		Where("mercado_pago_id = ?", mpID).
		Update("status", status).Error
}

func (r *paymentRepository) Delete(id uint) error {
	return r.db.
		Delete(&Payment{}, id).Error
}
