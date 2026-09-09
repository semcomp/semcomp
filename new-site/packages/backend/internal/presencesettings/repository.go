package presencesettings

import (
	"gorm.io/gorm"
)

type PresenceSettingsRepository interface {
	Create(weight *PresenceTypeWeight) error
	GetAll() ([]PresenceTypeWeight, error)
	GetByTypeName(typeName string) (*PresenceTypeWeight, error)
	UpdateByTypeName(typeName string, updated *PresenceTypeWeight) error
	DeleteByTypeName(typeName string) error
}

type presenceSettingsRepository struct {
	db *gorm.DB
}

func NewPresenceSettingsRepository(db *gorm.DB) PresenceSettingsRepository {
	return &presenceSettingsRepository{db: db}
}

func (r *presenceSettingsRepository) Create(weight *PresenceTypeWeight) error {
	return r.db.Create(weight).Error
}

func (r *presenceSettingsRepository) GetAll() ([]PresenceTypeWeight, error) {
	var weights []PresenceTypeWeight
	err := r.db.Order("type_name asc").Find(&weights).Error
	if err != nil {
		return nil, err
	}
	return weights, nil
}

func (r *presenceSettingsRepository) GetByTypeName(typeName string) (*PresenceTypeWeight, error) {
	var weight PresenceTypeWeight
	err := r.db.Where("LOWER(TRIM(type_name)) = LOWER(?)", typeName).First(&weight).Error
	if err != nil {
		return nil, err
	}
	return &weight, nil
}

func (r *presenceSettingsRepository) UpdateByTypeName(typeName string, updated *PresenceTypeWeight) error {
	result := r.db.Model(&PresenceTypeWeight{}).
		Where("LOWER(TRIM(type_name)) = LOWER(?)", typeName).
		Updates(map[string]interface{}{
			"type_name":              updated.TypeName,
			"weight":                 updated.Weight,
			"default_has_attendance": updated.DefaultHasAttendance,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *presenceSettingsRepository) DeleteByTypeName(typeName string) error {
	result := r.db.Where("LOWER(TRIM(type_name)) = LOWER(?)", typeName).Delete(&PresenceTypeWeight{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
