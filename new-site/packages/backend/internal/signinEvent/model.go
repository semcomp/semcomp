package signinEvent

import "time"

type RegistrationStatus string

const (
	StatusRegistered RegistrationStatus = "Inscrito"
	StatusWaitListed RegistrationStatus = "Lista de Espera"
	StatusCancelled  RegistrationStatus = "Cancelado"
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
