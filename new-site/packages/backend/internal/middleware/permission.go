package middleware

import (
	"net/http"

	"backend/internal/permission"

	"github.com/gin-gonic/gin"
)

// RequirePermission checks that the authenticated backoffice user holds at least
// the required level for the given section. Must run after AuthBackofficeMiddleware.
func RequirePermission(permSvc permission.PermissionService, section string, required permission.PermissionLevel) gin.HandlerFunc {
	return func(c *gin.Context) {
		email, exists := c.Get("email")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Sem autenticação"})
			return
		}

		ok, err := permSvc.CheckPermission(email.(string), section, required)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar permissões"})
			return
		}
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Permissões insuficientes para operar na seção '" + section + "'",
			})
			return
		}

		c.Next()
	}
}
