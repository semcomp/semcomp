package models

import "gorm.io/gorm"

type User struct {
	// Atualmente as tabelas tão sendo criadas com ID artificial por causa do gorm.model.
	// Assim que o MER da semcomp estiver completo isso deve ser alterado, definindo
	// no model qual campo é a primary key de verdade da tabela
	gorm.Model
	Name         string `gorm:"size:255;not null" json:"name"`
	LastName     string `gorm:"size:255;not null" json:"last_name"`
	Email        string `gorm:"size:255;unique;not null" json:"email"`
	PasswordHash string `gorm:"size:255;not null" json:"-"` // O traço impede que a senha vaze na API
	// Nusp		 string `gorm:"size:20;unique" json:"numero_usp"`
}
