package main

import (
	"backend/internal/database"
	"backend/internal/auth"
	"backend/internal/middleware"
	"backend/internal/providers"
	"backend/internal/user"

	"github.com/gin-gonic/gin"
)

func main() {
	db, errDB := database.ConnectDB()
	if errDB != nil {
		panic("Failed to connect to database: " + errDB.Error())
	}

	err := db.AutoMigrate(&user.User{})
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// Inicializa as camadas da aplicação (Repository -> Service -> Handler)
	passwordProvider := providers.NewBcryptProvider()
	jwtProvider := providers.NewJWTProvider()

	userRepo := user.NewUserRepository(db)
	userService := user.NewUserService(userRepo, passwordProvider)
	userHandler := user.NewUserHandler(userService)

	authService := auth.NewAuthService(userRepo, passwordProvider, jwtProvider)
	authHandler := auth.NewAuthHandler(authService, userService)

	r := gin.Default()

	// Rotas Públicas
	r.POST("/register", userHandler.CreateUser)
	r.POST("/login", authHandler.LoginHandler)
	
	// Rotas Protegidas (exigem autenticação)
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware(jwtProvider))
	authRoutes.GET("/profile", authHandler.ProfileHandler())

	// Rotas Backoffice (exigem autenticação de usuários do backoffice)
	// TODO: adicionar um middleware de autenticação de usuários do backoffice para essa rotas
	backofficeRoutes := r.Group("/admin")
	backofficeRoutes.PUT("/users/:id", userHandler.UpdateUser)
	backofficeRoutes.DELETE("/users/:id", userHandler.DeleteUser)
	backofficeRoutes.GET("/users", userHandler.GetAllUsers)
	backofficeRoutes.GET("/users/:id", userHandler.GetUserByID)
	r.Run(":4000")
}
