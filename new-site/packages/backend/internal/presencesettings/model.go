package presencesettings

import "time"

// PresenceTypeWeight armazena o peso de presença de um tipo de evento.
type PresenceTypeWeight struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TypeName  string    `gorm:"size:50;uniqueIndex;not null" json:"type_name"`
	Weight    float64   `gorm:"not null" json:"weight"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreatePresenceTypeWeightRequest struct {
	TypeName string  `json:"type_name" binding:"required,max=50"`
	Weight   float64 `json:"weight" binding:"gte=0"`
}

type UpdatePresenceTypeWeightRequest struct {
	TypeName string  `json:"type_name" binding:"required,max=50"`
	Weight   float64 `json:"weight" binding:"gte=0"`
}

type PresencesSettingsListResult struct {
	Weights []PresenceTypeWeight `json:"weights"`
}
