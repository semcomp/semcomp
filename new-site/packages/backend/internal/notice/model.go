package notice

import "time"

type Notice struct {
	ID       uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Title    string    `gorm:"size(255);not null" json:"title"`
	Content  string    `gorm:"type(text);not null" json:"content"`
	DateTime time.Time `gorm:"not null" json:"date_time"`
}

// DTOs de Requisição ---------

type CreateNoticeRequest struct {
	Title    string    `json:"title" binding:"required,max=255"`
	Content  string    `json:"content" binding:"required"`
	DateTime time.Time `json:"date_time" binding:"required"`
}

type UpdateNoticeRequest struct {
	Title    string    `json:"title" binding:"required,max=255"`
	Content  string    `json:"content" binding:"required"`
	DateTime time.Time `json:"date_time" binding:"required"`
}

// DTOs de Listagem ---------

type NoticeListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type NoticeListResult struct {
	Notices         []Notice `json:"notices"`
	TotalRecords    int64    `json:"total_records"`
	FilteredRecords int64    `json:"filtered_records"`
}