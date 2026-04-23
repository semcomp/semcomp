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
	authHandler := auth.NewAuthHandler(authService, userService)

	r := gin.Default()

	// Rotas Públicas
	r.POST("/register", userHandler.CreateUser)
	r.POST("/login", authHandler.LoginHandler)

  r.GET("/events", eventHandler.GetEvents)
	r.GET("/event/:eventName/:date", eventHandler.GetEventByNameAndDate)

	// Rotas Protegidas (Exigem Autenticação)
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
  
  backofficeRoutes.POST("/events", eventHandler.CreateEvent)
	backOfficeRoutes.PUT("/events/:eventName/:date", eventHandler.UpdateEventByNameAndDate)
	backOfficeRoutes.DELETE("/events/:eventName/:date", eventHandler.DeleteEventByNameAndDate)
	r.Run(":4000")
}
