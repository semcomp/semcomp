package signinEvent

import "time"

type RegistrationStatus string

const (
	StatusRegistered      RegistrationStatus = "Inscrito"
	StatusWaitingDonation RegistrationStatus = "Esperando Doação"
	StatusWaitListed      RegistrationStatus = "Lista de Espera"
)

type SigninEvent struct {
	UserNumber           uint               `gorm:"primaryKey" json:"user_number"`
	EventName            string             `gorm:"primaryKey;size:200" json:"event_name"`
	EventInitDate        time.Time          `gorm:"primaryKey" json:"event_init_date"`
	UserWaitListPosition uint               `json:"user_wait_list_position,omitempty"`
	Status               RegistrationStatus `gorm:"size:50;not null" json:"status"`
}

type CreateSigninRequest struct {
	EventName     string    `json:"event_name" binding:"required,max=200"`
	EventInitDate time.Time `json:"event_init_date" binding:"required"`
}

type CreateSigninAdminRequest struct {
	UserNumber    uint               `json:"user_number" binding:"required,gt=0"`
	EventName     string             `json:"event_name" binding:"required,max=200"`
	EventInitDate time.Time          `json:"event_init_date" binding:"required"`
	Status        RegistrationStatus `json:"status" binding:"required,oneof=Inscrito 'Lista de Espera' Cancelado"`
}

type UpdateSigninAdminRequest struct {
	Status RegistrationStatus `json:"status" binding:"required,oneof=Inscrito 'Lista de Espera' Cancelado"`
}

type SigninEventListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type SigninEventListResult struct {
	Signins         []SigninEvent `json:"signins"`
	TotalRecords    int64         `json:"total_records"`
	FilteredRecords int64         `json:"filtered_records"`
}

type SigninEventsDetailed struct {
	UserNumber           uint               `json:"user_number"`
	EventName            string             `json:"event_name"`
	EventInitDate        time.Time          `json:"event_init_date"`
	EventEndDate         time.Time          `json:"event_end_date"`
	EventType            string             `json:"event_type"`
	EventLocation        string             `json:"event_location"`
	EventDescription     string             `json:"event_description"`
	UserWaitListPosition uint               `json:"user_wait_list_position,omitempty"`
	Status               RegistrationStatus `json:"status"`
}
