package main

import (
	"backend/internal/auth"
	"backend/internal/authBackoffice"
	"backend/internal/database"
	"backend/internal/event"
	"backend/internal/log"
	"backend/internal/middleware"
	"backend/internal/permission"
	"backend/internal/presence"
	"backend/internal/providers"
	"backend/internal/section"
	"backend/internal/user"
	"backend/internal/userBackoffice"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	_ "backend/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Semcomp API
// @version 1.0
// @description API do backend da Semcomp.
// @host localhost:4000
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Insira o token no formato: Bearer {seu_token}
func main() {
	db, errDB := database.ConnectDB()
	if errDB != nil {
		panic("Failed to connect to database: " + errDB.Error())
	}

	err := db.AutoMigrate(&user.User{}, &event.Event{}, &presence.Presence{}, &section.Section{}, &userBackoffice.UserBackoffice{}, &log.AuditLog{}, &permission.Permission{})
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

	sectionRepo := section.NewSectionRepository(db)
	sectionService := section.NewSectionService(sectionRepo)
	sectionHandler := section.NewSectionHandler(sectionService)

	logRepo := log.NewRepository(db)
	logService := log.NewService(logRepo)

	userBackofficeRepo := userBackoffice.NewUserBackofficeRepository(db)
	userBackofficeService := userBackoffice.NewUserBackofficeService(userBackofficeRepo, passwordProvider)
	userBackofficeHandler := userBackoffice.NewUserBackofficeHandler(userBackofficeService)

	permissionRepo := permission.NewPermissionRepository(db)
	permissionService := permission.NewPermissionService(permissionRepo)
	permissionHandler := permission.NewPermissionHandler(permissionService, sectionService, userBackofficeService)

	authService := auth.NewAuthService(userRepo, passwordProvider, jwtProvider)
	authHandler := auth.NewAuthHandler(authService, userService)

	authBackofficeService := authBackoffice.NewAuthBackofficeService(userBackofficeRepo, passwordProvider, jwtProvider)
	authBackofficeHandler := authBackoffice.NewAuthBackofficeHandler(authBackofficeService, userBackofficeService, permissionService)

	// Inicialização de valores base de seções para o banco de dados
	if err := sectionService.InitializeSections(); err != nil {
		panic("Failed to initialize sections in backoffice: " + err.Error())
	}

	// Inicialização de valores base de admin para o banco de dados
	if err := userBackofficeService.InitializeAdmin(); err != nil {
		panic("Failed to initialize admin in backoffice: " + err.Error())
	}

	// Inicialização de valores base de permissões para o banco de dados
	if err := permissionService.InitializePermissions(); err != nil {
		panic("Failed to initialize admin's permissions in backoffice: " + err.Error())
	}

	r := gin.Default()
	r.Use(middleware.AuditMiddleware(logService))

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "https://semcomp.icmc.usp.br"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Content-Length"},
	}))

	// Rota para acessar a interface web do Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Rotas Públicas
	r.POST("/register", userHandler.CreateUser)
	r.POST("/login", authHandler.LoginHandler)

	r.GET("/events", eventHandler.GetEvents)
	r.GET("/event/:eventName/:initDate", eventHandler.GetEventByNameAndInitDate)

	// Rotas Protegidas (Exigem Autenticação)
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware(jwtProvider))
	authRoutes.GET("/profile", authHandler.ProfileHandler())

	// Rota Login Backoffice
	adminRoutes := r.Group("/admin")
	adminRoutes.POST("/login", authBackofficeHandler.LoginBackofficeHandler)

	// Rotas Backoffice (Exigem Autenticação)
	backofficeRoutes := adminRoutes.Group("/")
	backofficeRoutes.Use(middleware.AuthBackofficeMiddleware(jwtProvider))
	backofficeRoutes.PUT("/users/:id", userHandler.UpdateUser)
	backofficeRoutes.DELETE("/users/:id", userHandler.DeleteUser)
	backofficeRoutes.GET("/users", userHandler.GetAllUsers)
	backofficeRoutes.GET("/users/:id", userHandler.GetUserByID)
	backofficeRoutes.POST("/users", userHandler.CreateUser)

	backofficeRoutes.POST("/events", eventHandler.CreateEvent)
	backofficeRoutes.PUT("/events/:eventName/:initDate", eventHandler.UpdateEventByNameAndInitDate)
	backofficeRoutes.DELETE("/events/:eventName/:initDate", eventHandler.DeleteEventByNameAndInitDate)

	backofficeRoutes.POST("/presences", presenceHandler.CreatePresence)
	backofficeRoutes.GET("/presences", presenceHandler.GetPresences)
	backofficeRoutes.GET("/presences/:userNumber/:eventName/:eventInitDate", presenceHandler.GetPresenceByUserEventandInitDate)
	backofficeRoutes.PUT("/presences/:userNumber/:eventName/:eventInitDate", presenceHandler.UpdatePresenceByUserEventandInitDate)
	backofficeRoutes.DELETE("/presences/:userNumber/:eventName/:eventInitDate", presenceHandler.DeletePresenceByUserEventandInitDate)

	backofficeRoutes.POST("/sections", sectionHandler.CreateSection)
	backofficeRoutes.GET("/sections", sectionHandler.GetSections)
	backofficeRoutes.GET("/sections/:sectionName", sectionHandler.GetSectionByName)
	backofficeRoutes.PUT("/sections/:sectionName", sectionHandler.UpdateSectionByName)
	backofficeRoutes.DELETE("/sections/:sectionName", sectionHandler.DeleteSectionByName)

	backofficeRoutes.POST("/usersBackoffice", userBackofficeHandler.CreateUser)
	backofficeRoutes.GET("/usersBackoffice", userBackofficeHandler.GetAllUsers)
	backofficeRoutes.GET("/usersBackoffice/:email", userBackofficeHandler.GetUserByEmail)
	backofficeRoutes.PUT("/usersBackoffice/:email", userBackofficeHandler.UpdateUser)
	backofficeRoutes.DELETE("/usersBackoffice/:email", userBackofficeHandler.DeleteUser)

	backofficeRoutes.POST("/permissions", permissionHandler.CreatePermission)
	backofficeRoutes.GET("/permissions", permissionHandler.GetPermissions)
	backofficeRoutes.GET("/permissions/user/:user", permissionHandler.GetPermissionByUser)
	backofficeRoutes.GET("/permissions/section/:section", permissionHandler.GetPermissionBySection)
	backofficeRoutes.PUT("/permissions/:user/:section", permissionHandler.UpdatePermissionByUserSection)
	backofficeRoutes.DELETE("/permissions/:user/:section", permissionHandler.DeletePermissionByUserSection)

	r.Run(":4000")
}
