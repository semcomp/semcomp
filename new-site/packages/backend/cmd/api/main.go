package main

import (
	"backend/internal/auth"
	"backend/internal/database"
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
	authHandler := auth.NewAuthHandler(authService)

	r := gin.Default()

	// Rotas Públicas
	r.POST("/register", userHandler.CreateUser)
	r.GET("/users", userHandler.GetAllUsers)
	r.GET("/users/:id", userHandler.GetUserByID)
	r.PUT("/users/:id", userHandler.UpdateUser)
	r.DELETE("/users/:id", userHandler.DeleteUser)
	r.POST("/login", authHandler.LoginHandler)

	// Rotas Protegidas (Exigem Autenticação)
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware(jwtProvider))
	authRoutes.GET("/profile", authHandler.ProfileHandler())

	//adminRoutes := r.Group("/admin")
	//adminRoutes.POST("/presences", presenceHandler.CreatePresence)
	//adminRoutes.GET("/presences", presenceHandler.GetPresences)
	//adminRoutes.GET("/presences/:name/:event_name/:date", presenceHandler.GetPresenceByNameAndEvent)
	//adminRoutes.PUT("/presences/:name/:event_name/:date", presenceHandler.UpdatePresence)
	//adminRoutes.DELETE("/presences/:name/:event_name/:date", presenceHandler.DeletePresence)

	r.Run(":4000")
}
