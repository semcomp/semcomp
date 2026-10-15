package presence

import "time"

type Presence struct {
	UserNumber    int64     `gorm:"primaryKey;not null" json:"user_number"`
	EventName     string    `gorm:"size:200;primaryKey;not null" json:"event_name"`
	EventInitDate time.Time `gorm:"type:timestamptz;primaryKey;not null" json:"event_init_date"`
	EmailAdmin    string    `gorm:"size:255;not null" json:"email_admin"`
	// CreatedAt guarda o instante em que a presença foi lançada. Preenchido pelo
	// GORM no insert e nunca alterado no update (o instante original é o que
	// interessa para auditar duplicatas). Linhas anteriores à coluna ficam NULL.
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type CreatePresenceRequest struct {
	UserNumber    int64     `json:"user_number" binding:"required,gt=0"`
	EventName     string    `json:"event_name" binding:"required,max=200"`
	EventInitDate time.Time `json:"event_init_date" binding:"required"`
	EmailAdmin    string    `json:"email_admin" binding:"required,email,max=255"`
}

type UpdatePresenceRequest struct {
	UserNumber    int64     `json:"user_number" binding:"required,gt=0"`
	EventName     string    `json:"event_name" binding:"required,max=200"`
	EventInitDate time.Time `json:"event_init_date" binding:"required"`
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
	Presences       []Presence `json:"presences"`
	TotalRecords    int64      `json:"total_records"`
	FilteredRecords int64      `json:"filtered_records"`
}
