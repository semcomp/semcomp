package log

import "gorm.io/gorm"

type Repository interface {
    CreateAudit(entry AuditLog) error
    CreateError(entry ErrorLog) error
}

type repository struct {
    db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
    return &repository{db: db}
}

func (r *repository) CreateAudit(entry AuditLog) error {
    return r.db.Create(&entry).Error
}

func (r *repository) CreateError(entry ErrorLog) error {
    return r.db.Create(&entry).Error
}
