package sitestat

import (
	"errors"

	"gorm.io/gorm"
)

type SiteStatRepository struct {
	db *gorm.DB
}

func NewSiteStatRepository(db *gorm.DB) *SiteStatRepository {
	return &SiteStatRepository{db: db}
}

func (r *SiteStatRepository) Increment(key string) error {
	return r.db.Exec(
		"INSERT INTO site_stats (key, value) VALUES (?, 1) ON CONFLICT (key) DO UPDATE SET value = site_stats.value + 1",
		key,
	).Error
}

func (r *SiteStatRepository) Get(key string) (int64, error) {
	var stat SiteStat
	if err := r.db.First(&stat, "key = ?", key).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, nil
		}
		return 0, err
	}
	return stat.Value, nil
}
