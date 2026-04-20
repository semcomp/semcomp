package main

import (
	"backend/internal/database"
	"backend/internal/event"
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

	err := db.AutoMigrate(&user.User{}, &event.Event{})
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// Inicializa as camadas da aplicação (Repository -> Service -> Handler)
	passwordProvider := providers.NewBcryptProvider()
	jwtProvider := providers.NewJWTProvider()

	userRepo := user.NewUserRepository(db)
	userService := user.NewUserService(userRepo, passwordProvider)
	userHandler := user.NewUserHandler(userService)
	eventRepo := event.NewEventRepository(db)
	eventService := event.NewEventService(eventRepo)
	eventHandler := event.NewEventHandler(eventService)

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
	r.GET("/event/:eventName/:date", eventHandler.GetEventByNameAndDate)

	// Rotas Protegidas (Exigem Autenticação)
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware(jwtProvider))
	authRoutes.GET("/profile", authHandler.ProfileHandler())

	// Rotas de admin
	adminRoutes := r.Group("/admin")
	// TODO: admin middleware
	adminRoutes.POST("/events", eventHandler.CreateEvent)
	adminRoutes.PUT("/events/:eventName/:date", eventHandler.UpdateEventByNameAndDate)
	adminRoutes.DELETE("/events/:eventName/:date", eventHandler.DeleteEventByNameAndDate)

	r.Run(":4000")
}
