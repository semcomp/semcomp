package main

import (
	"backend/internal/auth"
	"backend/internal/database"
	"backend/internal/event"
	"backend/internal/middleware"
	"backend/internal/presence"
	"backend/internal/providers"
	"backend/internal/user"

	"github.com/gin-gonic/gin"
)

func main() {
	db, errDB := database.ConnectDB()
	if errDB != nil {
		panic("Failed to connect to database: " + errDB.Error())
	}

	err := db.AutoMigrate(&user.User{}, &event.Event{}, &presence.Presence{})
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

	presenceRepo := presence.NewPresenceRepository(db)
	presenceService := presence.NewPresenceService(presenceRepo)
	presenceHandler := presence.NewPresenceHandler(presenceService)

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

	adminRoutes := r.Group("/admin")
	adminRoutes.POST("/presences", presenceHandler.CreatePresence)
	adminRoutes.GET("/presences", presenceHandler.GetPresences)
	adminRoutes.GET("/presences/:name/:eventName/:eventDate", presenceHandler.GetPresenceByNameEventandDate)
	adminRoutes.PUT("/presences/:name/:eventName/:eventDate", presenceHandler.UpdatePresenceByNameEventandDate)
	adminRoutes.DELETE("/presences/:name/:eventName/:eventDate", presenceHandler.DeletePresenceByNameEventandDate)

	// Rotas Backoffice (exigem autenticação de usuários do backoffice)
	// TODO: adicionar um middleware de autenticação de usuários do backoffice para essa rotas
	backofficeRoutes := r.Group("/admin")
	backofficeRoutes.PUT("/users/:id", userHandler.UpdateUser)
	backofficeRoutes.DELETE("/users/:id", userHandler.DeleteUser)
	backofficeRoutes.GET("/users", userHandler.GetAllUsers)
	backofficeRoutes.GET("/users/:id", userHandler.GetUserByID)

	backofficeRoutes.POST("/events", eventHandler.CreateEvent)
	backofficeRoutes.PUT("/events/:eventName/:date", eventHandler.UpdateEventByNameAndDate)
	backofficeRoutes.DELETE("/events/:eventName/:date", eventHandler.DeleteEventByNameAndDate)

	backofficeRoutes.POST("/presences", presenceHandler.CreatePresence)
	backofficeRoutes.GET("/presences", presenceHandler.GetPresences)
	backofficeRoutes.GET("/presences/:name/:eventName/:eventDate", presenceHandler.GetPresenceByNameEventandDate)
	backofficeRoutes.PUT("/presences/:name/:eventName/:eventDate", presenceHandler.UpdatePresenceByNameEventandDate)
	backofficeRoutes.DELETE("/presences/:name/:eventName/:eventDate", presenceHandler.DeletePresenceByNameEventandDate)
	r.Run(":4000")
}
