package permission

import (
	"backend/internal/section"
	"backend/internal/userBackoffice"
)

type Permission struct {
	UserEmail      string `gorm:"size:150;primaryKey" json:"user_email"`
	SectionName    string `gorm:"size:200;primaryKey" json:"section_name"`
	PermissionType string `gorm:"size:2;not null" json:"permission_type"` // "RW" ou "R"

	User    *userBackoffice.UserBackoffice `gorm:"foreignKey:UserEmail" json:",omitempty"`
	Section *section.Section               `gorm:"foreignKey:SectionName" json:",omitempty"`
}

type PermissionRequest struct {
	UserEmail      string `json:"user_email" binding:"required,max=150"`
	SectionName    string `json:"section_name" binding:"required,max=200"`
	PermissionType string `json:"permission_type" binding:"required,max=2"`
}

type PermissionListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type PermissionListResult struct {
	Permissions     []Permission `json:"permissions"`
	TotalRecords    int64        `json:"total_records"`
	FilteredRecords int64        `json:"filtered_records"`
}
