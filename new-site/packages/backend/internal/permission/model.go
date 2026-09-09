package permission

import (
	"backend/internal/userBackoffice"
)

// PermissionLevel is a typed wrapper around the string values stored in the DB ("R" / "RW").
type PermissionLevel string

const (
	PermR  PermissionLevel = "R"
	PermRW PermissionLevel = "RW"
)

var levelOrder = map[PermissionLevel]int{
	PermR:  1,
	PermRW: 2,
}

// HasLevel returns true when actual satisfies the required minimum level.
func HasLevel(actual, required PermissionLevel) bool {
	return levelOrder[actual] >= levelOrder[required]
}

// KnownSections lists the backoffice sections that permissions apply to.
// Add a new entry here whenever a new section is added to the backoffice.
var KnownSections = []string{
	"Eventos",
	"Usuários Backoffice",
	"Usuários Semcomp",
	"Participações",
	"Configurações Presença",
	"Permissões",
	"Produtos",
	"Páginas",
	"Patrocinadores",
	"Vendas",
	"PAPFE",
	"Avisos",
	"Justificativas de Ausência",
	"Inscrições",
}

type Permission struct {
	UserEmail      string  `gorm:"size:150;primaryKey" json:"user_email"`
	SectionName    string  `gorm:"size:200;primaryKey" json:"section_name"`
	PermissionType *string `gorm:"size:2" json:"permission_type"` // nil = sem acesso, "R" ou "RW"

	User *userBackoffice.UserBackoffice `gorm:"foreignKey:UserEmail" json:",omitempty"`
}

type PermissionRequest struct {
	UserEmail      string  `json:"user_email" binding:"required,max=150"`
	SectionName    string  `json:"section_name" binding:"required,max=200"`
	PermissionType *string `json:"permission_type" binding:"omitempty,max=2"`
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
