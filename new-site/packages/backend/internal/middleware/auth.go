package middleware

import (
	"backend/internal/providers"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtProvider providers.JWTProvider) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("semcomp-site-token")
		if err != nil || tokenStr == "" {
			c.Set("responseMessage", "Cookie de autenticação ausente")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Não autenticado"})
			return
		}

		claims, err := jwtProvider.Parse(tokenStr)
		if err != nil {
			if errors.Is(err, providers.ErrJWTSecretNotConfigured) || errors.Is(err, providers.ErrJWTExpiresInHoursNotConfigured) {
				c.Set("internalError", err)
				c.Set("responseMessage", "Erro interno do servidor")
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Variável de ambiente não configurada"})
				return
			}
			if errors.Is(err, providers.ErrInvalidToken) {
				c.Set("responseMessage", "Token de autenticação inválido")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
				return
			}
			if errors.Is(err, providers.ErrInvalidTokenClaims) {
				c.Set("responseMessage", "Claims do token de autenticação inválidas")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
				return
			}
			if errors.Is(err, providers.ErrExpiredToken) {
				c.Set("responseMessage", "Tempo de sessão expirado")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token expirado"})
				return
			}

			c.Set("responseMessage", "Token de autenticação inválido")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}

		c.Set("userNumber", claims.UserNumber)
		c.Set("email", claims.Email)

		c.Next()
	}
}

func AuthBackofficeMiddleware(jwtProvider providers.JWTProvider) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("semcomp-backoffice-token")
		if err != nil || tokenStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Não autenticado"})
			return
		}

		claims, err := jwtProvider.ParseToBackoffice(tokenStr)
		if err != nil {
			if errors.Is(err, providers.ErrJWTSecretNotConfigured) || errors.Is(err, providers.ErrJWTExpiresInHoursNotConfigured) {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Variável de ambiente não configurada"})
				return
			}

			if errors.Is(err, providers.ErrInvalidToken) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
				return
			}

			if errors.Is(err, providers.ErrExpiredToken) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token expirado"})
				return
			}

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Sem autorização de administração"})
			return
		}

		c.Set("email", claims.Email)

		c.Next()
	}
}
