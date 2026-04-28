package section

type Section struct {
	Name        string `gorm:"size:200;primaryKey;not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
}

type CreateSectionRequest struct {
	Name        string `json:"name" binding:"required,max=200"`
	Description string `json:"description"`
}

type UpdateSectionRequest struct {
	Name        string `json:"name" binding:"required,max=200"`
	Description string `json:"description"`
}

type SectionListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type SectionListResult struct {
	Sections        []Section `json:"sections"`
	TotalRecords    int64     `json:"total_records"`
	FilteredRecords int64     `json:"filtered_records"`
}
