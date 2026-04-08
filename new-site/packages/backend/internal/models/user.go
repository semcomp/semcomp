package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name         string `gorm:"size:255;not null" json:"name"`
	LastName     string `gorm:"size:255;not null" json:"last_name"`
	Email        string `gorm:"size:255;unique;not null" json:"email"`
	PasswordHash string `gorm:"size:255;not null" json:"-"` // O traço impede que a senha vaze na API
	Nusp		 string `gorm:"size:20;unique" json:"numero_usp"`
}
