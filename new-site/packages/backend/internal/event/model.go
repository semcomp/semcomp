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
