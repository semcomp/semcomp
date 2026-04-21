package presence

import "time"

type Presence struct {
	Name          string    `gorm:"size:255;primaryKey;not null"`
	EventName     string    `gorm:"size:200;primaryKey;not null"`
	EventDateTime time.Time `gorm:"type:timestamptz;primaryKey;not null"`
	EmailAdmin    string    `gorm:"size:255;not null"`
}

type CreatePresenceRequest struct {
	Name          string    `json:"name" binding:"required,max=255"`
	EventName     string    `json:"event_name" binding:"required,max=200"`
	EventDateTime time.Time `json:"event_date_time" binding:"required"`
	EmailAdmin    string    `json:"email_admin" binding:"required,email,max=255"`
}

type UpdatePresenceRequest struct {
	Name          string    `json:"name" binding:"required,max=255"`
	EventName     string    `json:"event_name" binding:"required,max=200"`
	EventDateTime time.Time `json:"event_date_time" binding:"required"`
	EmailAdmin    string    `json:"email_admin" binding:"required,email,max=255"`
}

type PresenceListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type PresenceListResult struct {
	Presences       []Presence
	TotalRecords    int64
	FilteredRecords int64
}
