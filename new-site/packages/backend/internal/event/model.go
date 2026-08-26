package event

import (
	"time"

	"backend/internal/presencesettings"
)

type Event struct {
	Name              string                              `gorm:"size:200;primaryKey;not null" json:"name"`
	InitDate          time.Time                           `gorm:"type:timestamptz;primaryKey;not null" json:"init_date"`
	EndDate           time.Time                           `gorm:"type:timestamptz;not null" json:"end_date"`
	PresenceTypeID    *uint                               `gorm:"column:presence_type_weight_id;index" json:"presence_type_weight_id"`
	PresenceTypeWeight presencesettings.PresenceTypeWeight `gorm:"foreignKey:PresenceTypeID;constraint:OnDelete:SET NULL" json:"-"`
	TypeName          string                              `gorm:"-" json:"type_name"`
	Type              string                              `gorm:"size:50" json:"type"`
	Location          string                              `json:"location"`
	Description       string                              `gorm:"type:text" json:"description"`
	HasAttendance     bool                                `json:"has_attendance"`
}

type CreateEventRequest struct {
	Name              string    `json:"name" binding:"required,max=200"`
	InitDate          time.Time `json:"init_date" binding:"required"`
	EndDate           time.Time `json:"end_date" binding:"required"`
	PresenceTypeID    *uint     `json:"presence_type_weight_id"`
	Type              string    `json:"type" binding:"omitempty,max=50"`
	Location          string    `json:"location"`
	Description       string    `json:"description"`
	HasAttendance     *bool     `json:"has_attendance"`
	HasAttendanceSent bool      `json:"-"`
}

type UpdateEventRequest struct {
	Name              string    `json:"name" binding:"required,max=200"`
	InitDate          time.Time `json:"init_date" binding:"required"`
	EndDate           time.Time `json:"end_date" binding:"required"`
	PresenceTypeID    *uint     `json:"presence_type_weight_id"`
	Type              string    `json:"type" binding:"omitempty,max=50"`
	Location          string    `json:"location"`
	Description       string    `json:"description"`
	HasAttendance     *bool     `json:"has_attendance"`
	HasAttendanceSent bool      `json:"-"`
}

type EventListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type EventListResult struct {
	Events          []Event `json:"events"`
	TotalRecords    int64   `json:"total_records"`
	FilteredRecords int64   `json:"filtered_records"`
}
