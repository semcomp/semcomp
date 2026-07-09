package user

import (
	"fmt"
	"time"
)

type User struct {
	// TODO: Para a semcompona, atualizar o model
	UserNumber   uint    `gorm:"primaryKey;not null" json:"user_number"`
	Name         string  `gorm:"size:100;not null" json:"name"`
	Email        string  `gorm:"size:150;unique;not null" json:"email"`
	PasswordHash string  `gorm:"size:255;not null"`
	PresenceRate float64 `gorm:"not null" json:"presence_rate"`

	EmailVerified              bool   `gorm:"not null;default:false" json:"email_verified"`
	VerificationTokenHash      string `gorm:"size:255"`
	VerificationTokenExpiresAt *time.Time
	VerificationSentAt         *time.Time
	VerificationWindowStartAt  *time.Time
	VerificationSendCount      int `gorm:"not null;default:0"`
}

type CreateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type VerifyEmailRequest struct {
	Token string `json:"token" binding:"required"`
}

type ResendVerificationRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type UpdateUserRequest struct {
	Name         string  `json:"name" binding:"required"`
	Email        string  `json:"email" binding:"required,email"`
	Password     string  `json:"password" binding:"omitempty,min=8"`
	PresenceRate float64 `json:"presence_rate" binding:"gte=0"`
}

type SafeUser struct {
	UserNumber   string  `json:"user_number"`
	Name         string  `json:"name"`
	Email        string  `json:"email"`
	PresenceRate float64 `json:"presence_rate"`
}

func ToSafeUser(user *User) SafeUser {
	return SafeUser{
		UserNumber:   fmt.Sprintf("%05d", user.UserNumber),
		Name:         user.Name,
		Email:        user.Email,
		PresenceRate: user.PresenceRate,
	}
}

func ToSafeUsers(users []User) []SafeUser {
	safeUsers := make([]SafeUser, 0, len(users))
	for i := range users {
		safeUsers = append(safeUsers, ToSafeUser(&users[i]))
	}

	return safeUsers
}

type UserListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type UserListResult struct {
	Users           []SafeUser `json:"users"`
	TotalRecords    int64      `json:"total_records"`
	FilteredRecords int64      `json:"filtered_records"`
}
