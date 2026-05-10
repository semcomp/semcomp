package userBackoffice

type UserBackoffice struct {
	Email        string  `gorm:"size:150;primaryKey;not null" json:"email"`
	PasswordHash string  `gorm:"size:255;not null"`
}

// Nome gerado pelo gorm era pouco identificável (user_backoffices)
func (UserBackoffice) TableName() string {
  return "users_backoffice"
}

type CreateUserBackofficeRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type UpdateUserBackofficeRequest struct {
	Email        string  `json:"email" binding:"required,email"`
	Password     string  `json:"password" binding:"required,min=8"`
}

type SafeUserB struct {
	Email		string  `json:"email"`
}

func ToSafeUserB(userB *UserBackoffice) SafeUserB {
	return SafeUserB{
		Email:        userB.Email,
	}
}

func ToSafeUsersB(usersB []UserBackoffice) []SafeUserB {
	safeUsersB := make([]SafeUserB, 0, len(usersB))
	for i := range usersB {
		safeUsersB = append(safeUsersB, ToSafeUserB(&usersB[i]))
	}

	return safeUsersB
}

type UserBListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type UserBListResult struct {
	Users           []SafeUserB `json:"users"`
	TotalRecords    int64      `json:"total_records"`
	FilteredRecords int64      `json:"filtered_records"`
}
