package middleware

import (
	"backend/internal/models"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
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
		token, err := jwt.ParseWithClaims(tokenStr, &models.JWTClaims{}, func(t *jwt.Token) (any, error) {

			// Verifica se o método de assinatura é HMAC
			_, ok := t.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}

			// Verifica se a variável de ambiente JWT_SECRET está definida
			secret := os.Getenv("JWT_SECRET")
			if secret == "" {
				c.AbortWithStatusJSON(500, gin.H{"error": "server misconfigured"})
				return nil, fmt.Errorf("JWT_SECRET environment variable not set")
			}
			return []byte(secret), nil
		})

		// Valida o token
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			return
		}

		// Valida as claims do token
		claims, ok := token.Claims.(*models.JWTClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Expired token claims",
			})
			return
		}

		// Adiciona as informações do usuário ao contexto para uso em handlers subsequentes
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Subject)

		c.Next()
	}
}
