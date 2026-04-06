package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ProfileHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _ := c.Get("userID")
		email, _ := c.Get("email")

		// Teste de rota protegida, apenas para verificar se o middleware de autenticação JWT está funcionando corretamente
		c.Header("Content-Type", "application/json")
		c.Status(http.StatusOK)
		c.JSON(http.StatusOK, gin.H{
			"message": "Entrada Permitida",
			"userID":  userID,
			"email":   email,
		})
	}
}
