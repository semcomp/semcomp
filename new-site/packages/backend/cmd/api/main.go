package main

import (
	"backend/internal/auth"
	"backend/internal/authBackoffice"
	"backend/internal/database"
	"backend/internal/event"
	"backend/internal/log"
	"backend/internal/middleware"
	"backend/internal/pages"
	"backend/internal/permission"
	"backend/internal/presence"
	"backend/internal/providers"
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

	err := db.AutoMigrate(&user.User{}, &event.Event{}, &presence.Presence{}, &userBackoffice.UserBackoffice{}, &log.AuditLog{}, &permission.Permission{})
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

	logRepo := log.NewRepository(db)
	logService := log.NewService(logRepo)

	permissionRepo := permission.NewPermissionRepository(db)
	permissionService := permission.NewPermissionService(permissionRepo)

	pagesService := pages.NewService([]string{"home", "login", "cronograma", "profile", "riddle"})
	pagesHandler := pages.NewPagesHandler(pagesService)

	userBackofficeRepo := userBackoffice.NewUserBackofficeRepository(db)
	userBackofficeService := userBackoffice.NewUserBackofficeService(userBackofficeRepo, passwordProvider, permissionService.SeedUserPermissions)
	userBackofficeHandler := userBackoffice.NewUserBackofficeHandler(userBackofficeService)

	permissionHandler := permission.NewPermissionHandler(permissionService, userBackofficeService)

	authService := auth.NewAuthService(userRepo, passwordProvider, jwtProvider)
	authHandler := auth.NewAuthHandler(authService, userService)

	authBackofficeService := authBackoffice.NewAuthBackofficeService(userBackofficeRepo, passwordProvider, jwtProvider)
	authBackofficeHandler := authBackoffice.NewAuthBackofficeHandler(authBackofficeService, userBackofficeService, permissionService)

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

	// Rotas Semcomp - Públicas
	r.POST("/register", userHandler.CreateUser)
	r.POST("/login", authHandler.LoginHandler)

	r.GET("/events", eventHandler.GetEvents)
	r.GET("/event/:eventName/:initDate", eventHandler.GetEventByNameAndInitDate)

	r.GET("/pages/availability", pagesHandler.GetAllPagesAvailabilityHandler)
	r.GET("/pages/:page/availability", pagesHandler.GetPageAvailabilityHandler)

	// Rotas Semcomp - Protegidas
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware(jwtProvider))
	authRoutes.GET("/profile", authHandler.ProfileHandler())

	// Rota Login Backoffice - Públicas
	adminRoutes := r.Group("/admin")
	adminRoutes.POST("/login", authBackofficeHandler.LoginBackofficeHandler)

	// Rotas Backoffice - Protegidas
	admin := adminRoutes.Group("/")
	admin.Use(middleware.AuthBackofficeMiddleware(jwtProvider))

	permMW := func(section string, level permission.PermissionLevel) gin.HandlerFunc {
		return middleware.RequirePermission(permissionService, section, level)
	}

	// Usuários Semcomp
	admin.GET("/users", permMW("Usuários Semcomp", permission.PermR), userHandler.GetAllUsers)
	admin.GET("/users/:id", permMW("Usuários Semcomp", permission.PermR), userHandler.GetUserByID)
	admin.POST("/users", permMW("Usuários Semcomp", permission.PermRW), userHandler.CreateUser)
	admin.PUT("/users/:id", permMW("Usuários Semcomp", permission.PermRW), userHandler.UpdateUser)
	admin.DELETE("/users/:id", permMW("Usuários Semcomp", permission.PermRW), userHandler.DeleteUser)

	// Eventos
	admin.POST("/events", permMW("Eventos", permission.PermRW), eventHandler.CreateEvent)
	// GET nos eventos - Consulta pública via GET /events
	admin.PUT("/events/:eventName/:initDate", permMW("Eventos", permission.PermRW), eventHandler.UpdateEventByNameAndInitDate)
	admin.DELETE("/events/:eventName/:initDate", permMW("Eventos", permission.PermRW), eventHandler.DeleteEventByNameAndInitDate)

	// Participações
	admin.GET("/presences", permMW("Participações", permission.PermR), presenceHandler.GetPresences)
	admin.GET("/presences/:userNumber/:eventName/:eventInitDate", permMW("Participações", permission.PermR), presenceHandler.GetPresenceByUserEventandInitDate)
	admin.POST("/presences", permMW("Participações", permission.PermRW), presenceHandler.CreatePresence)
	admin.PUT("/presences/:userNumber/:eventName/:eventInitDate", permMW("Participações", permission.PermRW), presenceHandler.UpdatePresenceByUserEventandInitDate)
	admin.DELETE("/presences/:userNumber/:eventName/:eventInitDate", permMW("Participações", permission.PermRW), presenceHandler.DeletePresenceByUserEventandInitDate)

	// Usuários Backoffice
	admin.GET("/usersBackoffice", permMW("Usuários Backoffice", permission.PermR), userBackofficeHandler.GetAllUsers)
	admin.GET("/usersBackoffice/:email", permMW("Usuários Backoffice", permission.PermR), userBackofficeHandler.GetUserByEmail)
	admin.POST("/usersBackoffice", permMW("Usuários Backoffice", permission.PermRW), userBackofficeHandler.CreateUser)
	admin.PUT("/usersBackoffice/:email", permMW("Usuários Backoffice", permission.PermRW), userBackofficeHandler.UpdateUser)
	admin.DELETE("/usersBackoffice/:email", permMW("Usuários Backoffice", permission.PermRW), userBackofficeHandler.DeleteUser)

	// Permissões
	// GET /permissions/me não exige "Permissões R" — qualquer admin autenticado pode
	// consultar suas próprias permissões (email lido do JWT, não do URL)
	admin.GET("/permissions/me", permissionHandler.GetMyPermissions)
	admin.GET("/permissions", permMW("Permissões", permission.PermR), permissionHandler.GetPermissions)
	admin.GET("/permissions/section/:section", permMW("Permissões", permission.PermR), permissionHandler.GetPermissionBySection)
	admin.POST("/permissions", permMW("Permissões", permission.PermRW), permissionHandler.CreatePermission)
	admin.PUT("/permissions/:user/:section", permMW("Permissões", permission.PermRW), permissionHandler.UpdatePermissionByUserSection)
	admin.DELETE("/permissions/:user/:section", permMW("Permissões", permission.PermRW), permissionHandler.DeletePermissionByUserSection)

	// Páginas
	admin.PUT("/pages/:page/availability", permMW("Páginas", permission.PermRW), pagesHandler.SetPageAvailabilityHandler)

	r.Run(":4000")
}
