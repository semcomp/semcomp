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
