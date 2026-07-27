package sitestat

type SiteStat struct {
	Key   string `gorm:"primaryKey;size:100"`
	Value int64  `gorm:"not null;default:0"`
}
