package userBackoffice

type UserBackoffice struct {
	Email        	string  			`gorm:"size:150;unique;not null" json:"email"`
	PasswordHash 	string  			`gorm:"size:255;not null"`
}

type CreateUserBackofficeRequest struct {
	Email    		string `json:"email" binding:"required,email"`
	Password 		string `json:"password" binding:"required,min=8"`
}

type UpdateUserBackofficeRequest struct {
	Email        string  `json:"email" binding:"required,email"`
	Password     string  `json:"password" binding:"omitempty,min=8"`
}

type SafeUserBackoffice struct {
	Email        	string  `json:"email"`		
}

func ToSafeUserBackoffice(userB *UserBackoffice) SafeUserBackoffice {
	return SafeUserBackoffice{
		Email:        	userB.Email,
	}
}

func ToSafeUsersB(users []UserBackoffice) []SafeUserBackoffice {
	safeUsers := make([]SafeUserBackoffice, 0, len(users))
	for i := range users {
		safeUsers = append(safeUsers, ToSafeUserBackoffice(&users[i]))
	}

	return safeUsers
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
	Users           []SafeUserBackoffice 	`json:"users_backoffice"`
	TotalRecords    int64      				`json:"total_records"`
	FilteredRecords int64      				`json:"filtered_records"`
}
