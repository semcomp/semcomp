package sponsor

type Sponsor struct {
	CNPJ    string `gorm:"size:14;primaryKey" json:"cnpj"`
	Name    string `gorm:"size:200;not null" json:"name"`
	Website string `gorm:"size:500;not null" json:"website"`
	Logo    string `gorm:"size:500" json:"logo"`
	Clicks  int64  `gorm:"not null;default:0" json:"clicks"`

	Packages []SponsorPackage `gorm:"foreignKey:SponsorCNPJ;constraint:OnDelete:CASCADE" json:"packages,omitempty"`
}

type SponsorPackage struct {
	SponsorCNPJ string `gorm:"size:14;primaryKey" json:"sponsor_cnpj"`
	Year        int    `gorm:"primaryKey" json:"year"`
	Package     string `gorm:"size:100;primaryKey" json:"package"`
}

// DTOs -------------------------

type CreateSponsorRequest struct {
	CNPJ    string `form:"cnpj" binding:"required,len=14"`
	Name    string `form:"name" binding:"required,max=200"`
	Website string `form:"website" binding:"required,max=500"`
	LogoURL string `form:"logo_url"`
}

type UpdateSponsorRequest struct {
	Name    string `form:"name" binding:"required,max=200"`
	Website string `form:"website" binding:"required,max=500"`
	LogoURL string `form:"logo_url"`
}

type AddPackageRequest struct {
	Year    int    `json:"year" binding:"required,min=2000,max=2100"`
	Package string `json:"package" binding:"required,max=100"`
}

// ListQuery / ListResult -------

type SponsorListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type SponsorListResult struct {
	Sponsors        []Sponsor `json:"sponsors"`
	TotalRecords    int64     `json:"total_records"`
	FilteredRecords int64     `json:"filtered_records"`
}

// PublicSponsor é o shape exposto pelo endpoint público GET /sponsors.
// Não inclui Clicks para não expor métricas internas.
type PublicSponsor struct {
	CNPJ    string `json:"cnpj"`
	Name    string `json:"name"`
	Logo    string `json:"logo"`
	Website string `json:"website"`
}
