package middleware

import (
	"net/http"

	"backend/internal/pages"

	"github.com/gin-gonic/gin"
)

// RequirePageAvailable blocks the request if the given page is not available.
func RequirePageAvailable(pageService pages.Service, pageName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		available, err := pageService.GetPageAvailability(pageName)
		if err != nil || !available {
			c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "Página não disponível"})
			return
		}
		c.Next()
	}
}
