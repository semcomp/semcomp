package main

import (
	"os"
	"strconv"

	"backend/internal/auth"
	"backend/internal/authBackoffice"
	"backend/internal/database"
	"backend/internal/event"
	"backend/internal/log"
	"backend/internal/mailer"
	"backend/internal/middleware"
	"backend/internal/pages"
	"backend/internal/permission"
	"backend/internal/presence"
	"backend/internal/product"
	"backend/internal/providers"
	"backend/internal/token"
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

	// Usado para "adotar" contas já existentes como verificadas logo abaixo, já que a
	// coluna email_verified é nova e não deve bloquear o login de usuários antigos.
	hadEmailVerifiedColumn := db.Migrator().HasColumn(&user.User{}, "email_verified")

	err := db.AutoMigrate(&user.User{}, &user.PapfeDocument{}, &event.Event{}, &presence.Presence{}, &userBackoffice.UserBackoffice{}, &log.AuditLog{}, &permission.Permission{}, &token.Token{})
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	if !hadEmailVerifiedColumn {
		if err := db.Exec("UPDATE users SET email_verified = true").Error; err != nil {
			panic("Failed to grandfather existing users as email-verified: " + err.Error())
		}
	}

	// Inicializa as camadas da aplicação (Repository -> Service -> Handler)
	passwordProvider := providers.NewBcryptProvider()
	jwtProvider := providers.NewJWTProvider()
	tokenProvider := providers.NewTokenProvider()
	mailProvider := providers.NewMailProvider()
	emailValidationProvider := providers.NewEmailValidationProvider()

	tokenRepo := token.NewRepository(db)

	smtpPort := 587
	if portStr := os.Getenv("SMTP_PORT"); portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			smtpPort = p
		}
	}

	m := mailer.NewMailer(mailer.Config{
		SMTP: mailer.SMTPConfig{
			Host:     os.Getenv("SMTP_HOST"),
			Port:     smtpPort,
			Username: os.Getenv("SMTP_USER"),
			Password: os.Getenv("SMTP_PASSWORD"),
		},
		BaseURL: os.Getenv("FRONTEND_URL"),
	})

	userRepo := user.NewUserRepository(db)
	papfeRepo := user.NewPapfeDocumentRepository(db)
	userService := user.NewUserService(userRepo, papfeRepo, passwordProvider, tokenProvider, mailProvider, emailValidationProvider, tokenRepo, m)
	userHandler := user.NewUserHandler(userService)

	eventRepo := event.NewEventRepository(db)
	eventService := event.NewEventService(eventRepo)
	eventHandler := event.NewEventHandler(eventService)

	presenceRepo := presence.NewPresenceRepository(db)
	presenceService := presence.NewPresenceService(presenceRepo)
	presenceHandler := presence.NewPresenceHandler(presenceService)

	productRepo := product.NewProductRepository(db)
	productService := product.NewProductService(productRepo)
	productHandler := product.NewProductHandler(productService)

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

	pageMW := func(page string) gin.HandlerFunc {
		return middleware.RequirePageAvailable(pagesService, page)
	}

	// Rotas Semcomp - Públicas
	r.POST("/register", pageMW("login"), userHandler.CreateUser)
	r.POST("/login", pageMW("login"), authHandler.LoginHandler)
	r.POST("/forgot-password", pageMW("login"), userHandler.ForgotPasswordHandler)
	r.POST("/reset-password", pageMW("login"), userHandler.ResetPasswordHandler)
	r.POST("/verify-email", pageMW("login"), userHandler.VerifyEmail)
	r.POST("/resend-verification", pageMW("login"), userHandler.ResendVerification)

	r.GET("/events", pageMW("cronograma"), eventHandler.GetEvents)
	r.GET("/event/:eventName/:initDate", pageMW("cronograma"), eventHandler.GetEventByNameAndInitDate)

	r.GET("/pages/availability", pagesHandler.GetAllPagesAvailabilityHandler)
	r.GET("/pages/:page/availability", pagesHandler.GetPageAvailabilityHandler)

	// Rotas Semcomp - Protegidas
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware(jwtProvider))
	authRoutes.GET("/profile", authHandler.ProfileHandler())
	authRoutes.GET("/verify-email", userHandler.VerifyEmailHandler)

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

	// Produtos
	admin.GET("/products", permMW("Produtos", permission.PermR), productHandler.GetProducts)
	admin.GET("/products/:id", permMW("Produtos", permission.PermR), productHandler.GetProductByID)
	admin.POST("/products", permMW("Produtos", permission.PermRW), productHandler.CreateProduct)
	admin.PUT("/products/:id", permMW("Produtos", permission.PermRW), productHandler.UpdateProductByID)
	admin.DELETE("/products/:id", permMW("Produtos", permission.PermRW), productHandler.DeleteProductByID)

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
