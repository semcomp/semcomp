package main

import (
	stdlog "log"
	"os"
	"strconv"
	"time"

	"backend/internal/absenceJustification"
	"backend/internal/auth"
	"backend/internal/authBackoffice"
	"backend/internal/database"
	"backend/internal/event"
	"backend/internal/log"
	"backend/internal/mailer"
	"backend/internal/middleware"
	"backend/internal/notice"
	"backend/internal/pages"
	"backend/internal/permission"
	"backend/internal/presence"
	"backend/internal/presencerate"
	"backend/internal/presencesettings"
	"backend/internal/product"
	"backend/internal/providers"
	"backend/internal/sales"
	"backend/internal/signinEvent"
	"backend/internal/sitestat"
	"backend/internal/sponsor"
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

	err := db.AutoMigrate(
		&user.User{}, &user.PapfeDocument{}, &event.Event{}, &presence.Presence{},
		&presencesettings.PresenceTypeWeight{},
		&signinEvent.SigninEvent{},
		&userBackoffice.UserBackoffice{}, &log.AuditLog{}, &permission.Permission{},
		&product.Product{}, &product.Kit{}, &product.Coffee{}, &product.ComboItem{},
		&token.Token{}, &sponsor.Sponsor{}, &sponsor.SponsorPackage{},
		&sitestat.SiteStat{}, &sales.Sale{}, &sales.SaleItem{}, &sales.ConsumedItem{},
		&absenceJustification.AbsenceJustification{}, &notice.Notice{},
	)

	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// A coluna kits.is_babydoll é órfã: o modelo atual usa is_babylook (camiseta
	// de uso cotidiano, categoria "Babylook"). O AutoMigrate não dropa colunas,
	// então uma DB antiga (que passou por AutoMigrate com o modelo IsBabydoll)
	// mantém is_babydoll, e um INSERT de kit falha em is_babylook NOT NULL.
	if db.Migrator().HasColumn(&product.Kit{}, "is_babydoll") {
		if err := db.Migrator().DropColumn(&product.Kit{}, "is_babydoll"); err != nil {
			panic("Failed to drop kits.is_babydoll column: " + err.Error())
		}
	}

	if !hadEmailVerifiedColumn {
		if err := db.Exec("UPDATE users SET email_verified = true").Error; err != nil {
			panic("Failed to grandfather existing users as email-verified: " + err.Error())
		}
	}

	// Com a trava de compra única, o status EXPIRADO passou a ser persistido
	// pelo sweeper de expiração (antes era apenas calculado em memória). O
	// AutoMigrate não altera CHECK constraints existentes, então recria a
	// status_chk para aceitar EXPIRADO em DBs antigas.
	if err := db.Exec("ALTER TABLE sales DROP CONSTRAINT IF EXISTS status_chk").Error; err != nil {
		panic("Failed to drop sales.status_chk constraint: " + err.Error())
	}
	if err := db.Exec("ALTER TABLE sales ADD CONSTRAINT status_chk CHECK (status IN ('PENDENTE','PAGO','REJEITADO','CANCELADO','REEMBOLSADO','EXPIRADO'))").Error; err != nil {
		panic("Failed to recreate sales.status_chk constraint: " + err.Error())
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
	eventService := event.NewEventService(eventRepo, db)
	eventHandler := event.NewEventHandler(eventService)

	signinEventRepo := signinEvent.NewSigninEventRepository(db)
	signinEventService := signinEvent.NewSigninEventService(signinEventRepo, eventRepo)
	signinEventHandler := signinEvent.NewSigninEventHandler(signinEventService)

	presenceRepo := presence.NewPresenceRepository(db)
	presenceService := presence.NewPresenceService(presenceRepo)
	presenceHandler := presence.NewPresenceHandler(presenceService)

	presenceSettingsRepo := presencesettings.NewPresenceSettingsRepository(db)
	presenceSettingsService := presencesettings.NewPresenceSettingsService(presenceSettingsRepo, db)
	presenceSettingsHandler := presencesettings.NewPresenceSettingsHandler(presenceSettingsService)

	// Motor de cálculo das taxas de presença: dispara recálculo automático a
	// cada mutação de presenças, eventos ou pesos configuráveis.
	rateCalculator := presencerate.NewCalculator(db)
	eventService.SetRateRecalculator(rateCalculator)
	presenceService.SetRateRecalculator(rateCalculator)
	presenceSettingsService.SetRateRecalculator(rateCalculator)
	
	absenceJustificationRepo := absenceJustification.NewAbsenceJustificationRepository(db)
	absenceJustificationService := absenceJustification.NewAbsenceJustificationService(absenceJustificationRepo)
	absenceJustificationService.SetRateRecalculator(rateCalculator)
	absenceJustificationHandler := absenceJustification.NewAbsenceJustificationHandler(absenceJustificationService)

	productRepo := product.NewProductRepository(db)
	productService := product.NewProductService(productRepo)
	productHandler := product.NewProductHandler(productService, papfeRepo)

	noticeRepo := notice.NewNoticeRepository(db)
	noticeService := notice.NewNoticeService(noticeRepo)
	noticeHandler := notice.NewNoticeHandler(noticeService)

	logRepo := log.NewRepository(db)
	logService := log.NewService(logRepo)

	permissionRepo := permission.NewPermissionRepository(db)
	permissionService := permission.NewPermissionService(permissionRepo)

	pagesService := pages.NewService([]string{"home", "login", "cronograma", "profile", "riddle", "loja"})
	pagesHandler := pages.NewPagesHandler(pagesService)

	userBackofficeRepo := userBackoffice.NewUserBackofficeRepository(db)
	userBackofficeService := userBackoffice.NewUserBackofficeService(userBackofficeRepo, passwordProvider, permissionService.SeedUserPermissions)
	userBackofficeHandler := userBackoffice.NewUserBackofficeHandler(userBackofficeService)

	permissionHandler := permission.NewPermissionHandler(permissionService, userBackofficeService)

	sponsorRepo := sponsor.NewSponsorRepository(db)
	sponsorService := sponsor.NewSponsorService(sponsorRepo)
	sponsorHandler := sponsor.NewSponsorHandler(sponsorService)

	siteStatRepo := sitestat.NewSiteStatRepository(db)
	siteStatService := sitestat.NewSiteStatService(siteStatRepo)
	siteStatHandler := sitestat.NewSiteStatHandler(siteStatService)

	salesRepo := sales.NewSaleRepository(db)
	salesService := sales.NewSaleService(salesRepo, productRepo, papfeRepo)
	salesHandler := sales.NewSaleHandler(salesService)

	// Sweeper de expiração: persiste o status EXPIRADO nos PIX pendentes fora da
	// janela de validade e libera as travas de compra única (consumed_items)
	// das vendas expiradas. Antes, EXPIRADO era só calculado em memória; com a
	// trava "só compra uma vez", a expiração real é o que destrava o item.
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			expiredIDs, err := salesRepo.ExpirePendingPixSales()
			if err != nil {
				stdlog.Printf("[sweeper] erro ao expirar vendas PIX: %v", err)
				continue
			}
			for _, id := range expiredIDs {
				sales.Hub.Publish(id, string(sales.SaleStatusExpired))
				if err := salesRepo.DeleteConsumedBySale(id); err != nil {
					stdlog.Printf("[sweeper] erro ao liberar consumo da venda %d: %v", id, err)
				}
			}
			if len(expiredIDs) > 0 {
				stdlog.Printf("[sweeper] expiradas %d venda(s) PIX pendentes", len(expiredIDs))
			}
		}
	}()

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

	// Pesos padrão de presença (Palestra=1.0, Vitrine=0.5) em banco vazio
	if err := presenceSettingsService.InitializeDefaults(); err != nil {
		panic("Failed to initialize presence type weights: " + err.Error())
	}

	// Migração de dados: vincula eventos existentes ao seu tipo via FK
	if db.Migrator().HasColumn(&event.Event{}, "presence_type_weight_id") {
		type eventRow struct {
			Name     string
			InitDate time.Time
			Type     string
		}
		var unmapped []eventRow
		db.Raw("SELECT name, init_date, type FROM events WHERE presence_type_weight_id IS NULL AND type != ''").Scan(&unmapped)
		for _, e := range unmapped {
			var weightID uint
			if err := db.Raw("SELECT id FROM presence_type_weights WHERE LOWER(TRIM(type_name)) = LOWER(TRIM(?))", e.Type).Scan(&weightID).Error; err == nil && weightID > 0 {
				db.Model(&event.Event{}).Where("name = ? AND init_date = ?", e.Name, e.InitDate).Update("presence_type_weight_id", weightID)
			}
		}
	}

	// Convergência inicial: recalcula as taxas já persistidas com a configuração atual
	if err := rateCalculator.RecalculateAll(); err != nil {
		stdlog.Printf("[presence-rate] erro no recálculo inicial das taxas de presença: %v", err)
	}

	r := gin.Default()
	r.Use(middleware.AuditMiddleware(logService))

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "https://semcomp.icmc.usp.br"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Content-Length"},
	}))

	// Rota para acessar a interface web do Swagger (protegida por autenticação do backoffice)
	swaggerRoutes := r.Group("/swagger")
	swaggerRoutes.Use(middleware.AuthBackofficeMiddleware(jwtProvider))
	swaggerRoutes.GET("/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Serve apenas logos de patrocinadores (públicos). Documentos privados
	// (papfe, absence-justifications) são servidos exclusivamente via endpoints
	// autenticados — nunca via rota estática.
	r.Static("/uploads/sponsors", "./uploads/sponsors")

	pageMW := func(page string) gin.HandlerFunc {
		return middleware.RequirePageAvailable(pagesService, page)
	}

	// Rotas Semcomp - Públicas
	r.POST("/register", pageMW("login"), userHandler.CreateUser)
	r.POST("/login", pageMW("login"), authHandler.LoginHandler)
	r.POST("/logout", pageMW("login"), authHandler.LogoutHandler)
	r.POST("/forgot-password", pageMW("login"), userHandler.ForgotPasswordHandler)
	r.POST("/reset-password", pageMW("login"), userHandler.ResetPasswordHandler)
	r.POST("/verify-email", pageMW("login"), userHandler.VerifyEmail)
	r.POST("/resend-verification", pageMW("login"), userHandler.ResendVerification)

	r.GET("/events", pageMW("cronograma"), eventHandler.GetEvents)
	r.GET("/event/:eventName/:initDate", pageMW("cronograma"), eventHandler.GetEventByNameAndInitDate)

	r.GET("/sponsors", sponsorHandler.GetSponsors)
	r.POST("/sponsors/:cnpj/click", sponsorHandler.RecordClick)

	r.POST("/visit", siteStatHandler.RecordVisit)
	r.GET("/stats", siteStatHandler.GetStats)

	r.POST("/webhook/mercadopago", salesHandler.Webhook)

	r.GET("/pages/availability", pagesHandler.GetAllPagesAvailabilityHandler)
	r.GET("/pages/:page/availability", pagesHandler.GetPageAvailabilityHandler)

	// Rotas Semcomp - Protegidas
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware(jwtProvider))
	authRoutes.GET("/profile", authHandler.ProfileHandler())
	authRoutes.PUT("/profile", userHandler.UpdateProfile)
	authRoutes.GET("/verify-email", userHandler.VerifyEmailHandler)
	authRoutes.PUT("/papfe-document", userHandler.UpdatePapfeDocument)
	authRoutes.GET("/papfe-document", userHandler.GetMyPapfeDocument)
	authRoutes.POST("/absence-justifications", absenceJustificationHandler.CreateAbsenceJustification)
	authRoutes.GET("/absence-justifications/mine", absenceJustificationHandler.GetMine)
	authRoutes.GET("/absence-justifications/:id/attachment", absenceJustificationHandler.GetOwnAttachment)
	authRoutes.PATCH("/absence-justifications/:id", absenceJustificationHandler.UpdateMine)

	authRoutes.GET("/notices", noticeHandler.GetNotices)

	// Inscrições em Eventos (Usuário)
	authRoutes.POST("/signin-events", pageMW("profile"), pageMW("cronograma"), signinEventHandler.CreateSignin)
	authRoutes.GET("/signin-events", pageMW("profile"), pageMW("cronograma"), signinEventHandler.GetSigninEvents)
	authRoutes.GET("/signin-events/me", pageMW("profile"), pageMW("cronograma"), signinEventHandler.GetMySignins)
	authRoutes.DELETE("/signin-events/:eventName/:eventInitDate", pageMW("profile"), pageMW("cronograma"), signinEventHandler.DeleteSignin)

	// Produtos (requer autenticação para exibir desconto PAPFE)
	authRoutes.GET("/products", pageMW("loja"), productHandler.GetProducts)

	// Rotas de Vendas (Usuário)
	authRoutes.POST("/sales", pageMW("loja"), salesHandler.CreateSale)
	authRoutes.GET("/sales/profile", pageMW("loja"), salesHandler.GetMySales)
	authRoutes.GET("/sales/consumed", pageMW("loja"), salesHandler.GetConsumed)
	authRoutes.GET("/sales/:id", pageMW("loja"), salesHandler.GetSaleByID)
	authRoutes.GET("/sales/:id/status", pageMW("loja"), salesHandler.GetSaleStatus)
	authRoutes.GET("/sales/:id/events", pageMW("loja"), salesHandler.StreamSaleStatus)
	authRoutes.POST("/sales/:id/cancel", pageMW("loja"), salesHandler.CancelSale)

	// Rota Login Backoffice - Públicas
	adminRoutes := r.Group("/admin")
	adminRoutes.POST("/login", authBackofficeHandler.LoginBackofficeHandler)
	adminRoutes.POST("/logout", authBackofficeHandler.LogoutBackofficeHandler)

	// Rotas Backoffice - Protegidas
	admin := adminRoutes.Group("/")
	admin.Use(middleware.AuthBackofficeMiddleware(jwtProvider))

	permMW := func(section string, level permission.PermissionLevel) gin.HandlerFunc {
		return middleware.RequirePermission(permissionService, section, level)
	}

	// Usuários Semcomp
	admin.GET("/users", permMW("Usuários Semcomp", permission.PermR), userHandler.GetAllUsers)
	admin.GET("/users/:id", permMW("Usuários Semcomp", permission.PermR), userHandler.GetUserByID)
	admin.GET("/papfe-documents", permMW("PAPFE", permission.PermR), userHandler.GetAllPapfeDocuments)
	admin.GET("/users/:id/papfe-document", permMW("PAPFE", permission.PermR), userHandler.GetPapfeDocument)
	admin.PUT("/users/:id/papfe-document/approval", permMW("PAPFE", permission.PermRW), userHandler.ApprovePapfeDocument)
	admin.POST("/users", permMW("Usuários Semcomp", permission.PermRW), userHandler.CreateUser)
	admin.PUT("/users/:id", permMW("Usuários Semcomp", permission.PermRW), userHandler.UpdateUser)
	admin.DELETE("/users/:id", permMW("Usuários Semcomp", permission.PermRW), userHandler.DeleteUser)

	// Eventos
	admin.GET("/events", permMW("Eventos", permission.PermR), eventHandler.GetEvents)
	admin.POST("/events", permMW("Eventos", permission.PermRW), eventHandler.CreateEvent)
	admin.PUT("/events/:eventName/:initDate", permMW("Eventos", permission.PermRW), eventHandler.UpdateEventByNameAndInitDate)
	admin.DELETE("/events/:eventName/:initDate", permMW("Eventos", permission.PermRW), eventHandler.DeleteEventByNameAndInitDate)

	// Inscrições (Signin Events)
	admin.GET("/signin-events", permMW("Inscrições", permission.PermR), signinEventHandler.GetSigninsAdmin)
	admin.GET("/signin-events/:userNumber/:eventName/:eventInitDate", permMW("Inscrições", permission.PermR), signinEventHandler.GetSigninAdmin)
	admin.POST("/signin-events", permMW("Inscrições", permission.PermRW), signinEventHandler.CreateSigninAdmin)
	admin.PUT("/signin-events/:userNumber/:eventName/:eventInitDate", permMW("Inscrições", permission.PermRW), signinEventHandler.UpdateSigninAdmin)
	admin.DELETE("/signin-events/:userNumber/:eventName/:eventInitDate", permMW("Inscrições", permission.PermRW), signinEventHandler.DeleteSigninAdmin)
	admin.PUT("/signin-events/:userNumber/:eventName/:eventInitDate/register", permMW("Inscrições", permission.PermRW), signinEventHandler.RegisterSigninAdmin)
	admin.POST("/signin-events/rotate/:eventName/:eventInitDate", permMW("Inscrições", permission.PermRW), signinEventHandler.RotateSigninsAdmin)

	// Participações
	admin.GET("/presences", permMW("Participações", permission.PermR), presenceHandler.GetPresences)
	admin.GET("/presences/:userNumber/:eventName/:eventInitDate", permMW("Participações", permission.PermR), presenceHandler.GetPresenceByUserEventandInitDate)
	admin.POST("/presences", permMW("Participações", permission.PermRW), presenceHandler.CreatePresence)
	admin.PUT("/presences/:userNumber/:eventName/:eventInitDate", permMW("Participações", permission.PermRW), presenceHandler.UpdatePresenceByUserEventandInitDate)
	admin.DELETE("/presences/:userNumber/:eventName/:eventInitDate", permMW("Participações", permission.PermRW), presenceHandler.DeletePresenceByUserEventandInitDate)

	// Configurações de Presença (pesos por tipo de evento)
	admin.GET("/presence-settings", permMW("Configurações Presença", permission.PermR), presenceSettingsHandler.GetWeights)
	admin.POST("/presence-settings", permMW("Configurações Presença", permission.PermRW), presenceSettingsHandler.CreateWeight)
	admin.PUT("/presence-settings/:typeName", permMW("Configurações Presença", permission.PermRW), presenceSettingsHandler.UpdateWeight)
	admin.DELETE("/presence-settings/:typeName", permMW("Configurações Presença", permission.PermRW), presenceSettingsHandler.DeleteWeight)
	
	// Justificativas de Ausência
	admin.GET("/absence-justifications", permMW("Justificativas de Ausência", permission.PermR), absenceJustificationHandler.GetAbsenceJustifications)
	admin.GET("/absence-justifications/:id/attachment", permMW("Justificativas de Ausência", permission.PermR), absenceJustificationHandler.GetAttachment)
	admin.PATCH("/absence-justifications/:id", permMW("Justificativas de Ausência", permission.PermRW), absenceJustificationHandler.UpdateStatus)

	// Usuários Backoffice
	admin.GET("/usersBackoffice", permMW("Usuários Backoffice", permission.PermR), userBackofficeHandler.GetAllUsers)
	admin.GET("/usersBackoffice/:email", permMW("Usuários Backoffice", permission.PermR), userBackofficeHandler.GetUserByEmail)
	admin.POST("/usersBackoffice", permMW("Usuários Backoffice", permission.PermRW), userBackofficeHandler.CreateUser)
	admin.PUT("/usersBackoffice/:email", permMW("Usuários Backoffice", permission.PermRW), userBackofficeHandler.UpdateUser)
	admin.DELETE("/usersBackoffice/:email", permMW("Usuários Backoffice", permission.PermRW), userBackofficeHandler.DeleteUser)

	// Produtos
	admin.GET("/coffees", permMW("Produtos", permission.PermR), productHandler.GetCoffees)
	admin.GET("/coffees/verify/:userNumber/:dateTime", permMW("Produtos", permission.PermR), salesHandler.VerifyCoffeeAccess)
	admin.GET("/products", permMW("Produtos", permission.PermR), productHandler.GetProducts)
	admin.GET("/products/:id", permMW("Produtos", permission.PermR), productHandler.GetProductByID)
	admin.POST("/products", permMW("Produtos", permission.PermRW), productHandler.CreateProduct)
	admin.POST("/products/bulk", permMW("Produtos", permission.PermRW), productHandler.BulkCreateProducts)
	admin.PUT("/products/:id", permMW("Produtos", permission.PermRW), productHandler.UpdateProductByID)
	admin.DELETE("/products/:id", permMW("Produtos", permission.PermRW), productHandler.DeleteProductByID)

	// Vendas
	admin.GET("/sales", permMW("Vendas", permission.PermR), salesHandler.GetAllSales)
	admin.PUT("/sales/:id", permMW("Vendas", permission.PermRW), salesHandler.UpdateSaleByID)
	admin.DELETE("/sales/:id", permMW("Vendas", permission.PermRW), salesHandler.DeleteSaleByID)
	admin.PATCH("/sales/items/:itemId/pickup", permMW("Vendas", permission.PermRW), salesHandler.UpdateItemPickup)

	// Avisos
	admin.GET("/notices", permMW("Avisos", permission.PermR), noticeHandler.GetNotices)
	admin.GET("/notices/:id", permMW("Avisos", permission.PermR), noticeHandler.GetNoticeByID)
	admin.POST("/notices", permMW("Avisos", permission.PermRW), noticeHandler.CreateNotice)
	admin.PUT("/notices/:id", permMW("Avisos", permission.PermRW), noticeHandler.UpdateNoticeByID)
	admin.DELETE("/notices/:id", permMW("Avisos", permission.PermRW), noticeHandler.DeleteNoticeByID)

	// Permissões
	admin.GET("/permissions/me", permissionHandler.GetMyPermissions)
	admin.GET("/permissions", permMW("Permissões", permission.PermR), permissionHandler.GetPermissions)
	admin.GET("/permissions/section/:section", permMW("Permissões", permission.PermR), permissionHandler.GetPermissionBySection)
	admin.POST("/permissions", permMW("Permissões", permission.PermRW), permissionHandler.CreatePermission)
	admin.PUT("/permissions/:user/:section", permMW("Permissões", permission.PermRW), permissionHandler.UpdatePermissionByUserSection)
	admin.DELETE("/permissions/:user/:section", permMW("Permissões", permission.PermRW), permissionHandler.DeletePermissionByUserSection)

	// Páginas
	admin.PUT("/pages/:page/availability", permMW("Páginas", permission.PermRW), pagesHandler.SetPageAvailabilityHandler)

	// Patrocinadores
	admin.GET("/sponsors", permMW("Patrocinadores", permission.PermR), sponsorHandler.GetAllSponsors)
	admin.GET("/sponsors/:cnpj", permMW("Patrocinadores", permission.PermR), sponsorHandler.GetSponsorByCNPJ)
	admin.POST("/sponsors", permMW("Patrocinadores", permission.PermRW), sponsorHandler.CreateSponsor)
	admin.PUT("/sponsors/:cnpj", permMW("Patrocinadores", permission.PermRW), sponsorHandler.UpdateSponsor)
	admin.DELETE("/sponsors/:cnpj", permMW("Patrocinadores", permission.PermRW), sponsorHandler.DeleteSponsor)
	admin.GET("/sponsors/:cnpj/packages", permMW("Patrocinadores", permission.PermR), sponsorHandler.GetSponsorPackages)
	admin.POST("/sponsors/:cnpj/packages", permMW("Patrocinadores", permission.PermRW), sponsorHandler.AddSponsorPackage)
	admin.DELETE("/sponsors/:cnpj/packages/:year/:package", permMW("Patrocinadores", permission.PermRW), sponsorHandler.RemoveSponsorPackage)

	r.Run(":4000")
}
