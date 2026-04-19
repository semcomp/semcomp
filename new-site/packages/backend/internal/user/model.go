package user

import "gorm.io/gorm"

type User struct {
	// Atualmente as tabelas tão sendo criadas com ID artificial por causa do gorm.model.
	// Assim que o MER da semcomp estiver completo isso deve ser alterado, definindo
	// no model qual campo é a primary key de verdade da tabela
	gorm.Model
	Name         string `gorm:"size:255;not null"`
	LastName     string `gorm:"size:255;not null"`
	Email        string `gorm:"size:255;unique;not null"`
	PasswordHash string `gorm:"size:255;not null"`
	// Nusp		 string `gorm:"size:20;unique"
}

type CreateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	LastName string `json:"last_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type UpdateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	LastName string `json:"last_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"omitempty,min=8"`
}

type SafeUser struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	LastName string `json:"last_name"`
	Email    string `json:"email"`
}

func ToSafeUser(user *User) SafeUser {
	return SafeUser{
		ID:       user.ID,
		Name:     user.Name,
		LastName: user.LastName,
		Email:    user.Email,
	}
}

func ToSafeUsers(users []User) []SafeUser {
	safeUsers := make([]SafeUser, 0, len(users))
	for i := range users {
		safeUsers = append(safeUsers, ToSafeUser(&users[i]))
	}

	return safeUsers
}
