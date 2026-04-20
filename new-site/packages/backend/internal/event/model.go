package event

import "time"

type Event struct {
	Name          string    `gorm:"size:200;primaryKey;not null"`
	DateTime      time.Time `gorm:"type:timestamptz;primaryKey;not null"`
	Type          string    `gorm:"size:50"`
	Location      string
	Description   string    `gorm:"type:text"`
	HasAttendance bool
}

type CreateEventRequest struct {
	Name          string    `json:"name" binding:"required,max=200"`
	DateTime      time.Time `json:"date_time" binding:"required"`
	Type          string    `json:"type" binding:"omitempty,max=50"`
	Location      string    `json:"location"`
	Description   string    `json:"description"`
	HasAttendance bool      `json:"has_attendance"`
}

type UpdateEventRequest struct {
	Name          string    `json:"name" binding:"required,max=200"`
	DateTime      time.Time `json:"date_time" binding:"required"`
	Type          string    `json:"type" binding:"omitempty,max=50"`
	Location      string    `json:"location"`
	Description   string    `json:"description"`
	HasAttendance bool      `json:"has_attendance"`
}
