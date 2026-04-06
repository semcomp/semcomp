package main

import (
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

func main() {
	db, errDB := database.ConnectDB()
	if errDB != nil {
		panic("Failed to connect to database: " + errDB.Error())
	}

	// Cria a tabela de usuários no banco de dados se ainda não existir
	err := db.AutoMigrate(&models.User{})
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	r := gin.Default()

	// Rotas públicas
	r.POST("/register", handlers.RegisterHandler(db))
	r.POST("/login", handlers.LoginHandler(db))

	// Rotas protegidas por autenticação JWT
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware())

	//authRoutes.GET("/profile", handler)

	r.Run(":4000")
}
