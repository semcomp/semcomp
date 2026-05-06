package log

import "time"

type AuditLog struct {
    ID         uint      `gorm:"primaryKey"`
    CreatedAt  time.Time `gorm:"autoCreateTime"`
    UserNumber *uint     `gorm:"index"`
    UserEmail  *string   `gorm:"index"`
    StatusCode int       `gorm:"index"`
    Message    string    `gorm:"type:text"`
    Method     string    `gorm:"index"`
    Path       string    `gorm:"index"`
    LatencyMs  int64
}
