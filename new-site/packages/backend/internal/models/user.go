package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name         string `gorm:"size:255;not null"`
	LastName     string `gorm:"size:255;not null"`
	Email        string `gorm:"size:255;unique;not null"`
	PasswordHash string `gorm:"size:255;not null"`
}
