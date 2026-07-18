package user

import (
	"fmt"
	"time"

	"github.com/lib/pq"
)

type User struct {
	UserNumber    uint           `gorm:"primaryKey;not null" json:"user_number"`
	Name          string         `gorm:"size:100;not null" json:"name"`
	Email         string         `gorm:"size:150;unique;not null" json:"email"`
	PasswordHash  string         `gorm:"size:255;not null"`
	Age           int            `gorm:"not null" json:"age"`
	Gender        string         `gorm:"size:50;not null" json:"gender"`
	City          string         `gorm:"size:100;not null" json:"city"`
	Education     string         `gorm:"size:100;not null" json:"education"`
	HasPapfe      bool           `gorm:"not null" json:"hasPapfe"`
	Disabilities  pq.StringArray `gorm:"type:text[];not null;default:'{}'" json:"disabilities"`
	Profession    *string        `gorm:"size:120" json:"profession,omitempty"`
	Linkedin      *string        `gorm:"size:255" json:"linkedin,omitempty"`
	Telegram      *string        `gorm:"size:255" json:"telegram,omitempty"`
	PresenceRate  float64        `gorm:"not null" json:"presence_rate"`

	EmailVerified              bool       `gorm:"not null;default:false" json:"email_verified"`
	VerificationTokenHash      string     `gorm:"size:255"`
	VerificationTokenExpiresAt *time.Time
	VerificationSentAt         *time.Time
	VerificationWindowStartAt  *time.Time
	VerificationSendCount      int        `gorm:"not null;default:0"`
}

type CreateUserRequest struct {
	Name         string   `json:"name" binding:"required"`
	Email        string   `json:"email" binding:"required,email"`
	Password     string   `json:"password" binding:"required,min=8"`
	Age          int      `json:"age" binding:"required,gt=0"`
	Gender       string   `json:"gender" binding:"required"`
	City         string   `json:"city" binding:"required"`
	Education    string   `json:"education" binding:"required"`
	HasPapfe     bool     `json:"hasPapfe" binding:"oneof=true false"`
	Disabilities []string `json:"disabilities" binding:"required"`
	Profession   *string  `json:"profession,omitempty"`
	Linkedin     *string  `json:"linkedin,omitempty"`
	Telegram     *string  `json:"telegram,omitempty"`
}

type VerifyEmailRequest struct {
	Token string `json:"token" binding:"required"`
}

type ResendVerificationRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type UpdateUserRequest struct {
	Name         string   `json:"name" binding:"required"`
	Email        string   `json:"email" binding:"required,email"`
	Age          int      `json:"age" binding:"required,gt=0"`
	Gender       string   `json:"gender" binding:"required"`
	City         string   `json:"city" binding:"required"`
	Education    string   `json:"education" binding:"required"`
	HasPapfe     bool     `json:"hasPapfe" binding:"required"`
	Disabilities []string `json:"disabilities" binding:"required"`
	Profession   *string  `json:"profession,omitempty"`
	Linkedin     *string  `json:"linkedin,omitempty"`
	Telegram     *string  `json:"telegram,omitempty"`
}

type SafeUser struct {
	UserNumber    string   `json:"user_number"`
	Name          string   `json:"name"`
	Email         string   `json:"email"`
	Age           int      `json:"age"`
	Gender        string   `json:"gender"`
	City          string   `json:"city"`
	Education     string   `json:"education"`
	HasPapfe      bool     `json:"hasPapfe"`
	Disabilities  []string `json:"disabilities"`
	Profession    *string  `json:"profession,omitempty"`
	Linkedin      *string  `json:"linkedin,omitempty"`
	Telegram      *string  `json:"telegram,omitempty"`
	PresenceRate  float64  `json:"presence_rate"`
	EmailVerified bool     `json:"email_verified"`
}

func ToSafeUser(user *User) SafeUser {
	return SafeUser{
		UserNumber:    fmt.Sprintf("%05d", user.UserNumber),
		Name:          user.Name,
		Email:         user.Email,
		Age:           user.Age,
		Gender:        user.Gender,
		City:          user.City,
		Education:     user.Education,
		HasPapfe:      user.HasPapfe,
		Disabilities:  append([]string(nil), user.Disabilities...),
		Profession:    user.Profession,
		Linkedin:      user.Linkedin,
		Telegram:      user.Telegram,
		PresenceRate:  user.PresenceRate,
		EmailVerified: user.EmailVerified,
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

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}
