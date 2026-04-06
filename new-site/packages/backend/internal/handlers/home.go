package handlers

import (
	"fmt"
	"net/http"

	"gorm.io/gorm"
)

func HomeHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sqlDB, err := db.DB()
		if err != nil || sqlDB.PingContext(r.Context()) != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, "DB ERROR")
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "DB OK")
	}
}
