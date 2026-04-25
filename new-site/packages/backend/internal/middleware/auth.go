package middleware

import (
	"backend/internal/providers"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtProvider providers.JWTProvider) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verifica se o header Authorization está presente e tem o formato correto
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			return
		}

		// Extrai o token JWT do header
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := jwtProvider.Parse(tokenStr)
		if err != nil {
			if errors.Is(err, providers.ErrJWTSecretNotConfigured) {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "server misconfigured"})
				return
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			return
		}

		// Adiciona as informações do usuário ao contexto para uso em handlers subsequentes
		c.Set("userNumber", claims.UserNumber)
		c.Set("email", claims.Email)

		c.Next()
	}
}
