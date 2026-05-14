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
			c.Set("responseMessage", "Authorization header is required")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de cabeçalho de autorização está faltando"})
			return
		}
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.Set("responseMessage", "Invalid authorization header format")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de cabeçalho de autorização inválido"})
			return
		}

		// Extrai o token JWT do header
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
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

		// Adiciona as informações do usuário ao contexto para uso em handlers subsequentes
		c.Set("userNumber", claims.UserNumber)
		c.Set("email", claims.Email)

		c.Next()
	}
}

func AuthBackofficeMiddleware(jwtProvider providers.JWTProvider) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verifica se o header Authorization está presente e tem o formato correto
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de cabeçalho de autorização está faltando"})
			return
		}
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de cabeçalho de autorização inválido"})
			return
		}

		// Extrai o token JWT do header
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
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
