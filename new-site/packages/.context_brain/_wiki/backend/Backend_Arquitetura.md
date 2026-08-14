---
type: wiki-architecture
tags: [architecture, backend, golang, gin, gorm]
---
# Arquitetura Backend

Entrypoint: `backend/cmd/api/main.go`  
Framework: **Gin** + **GORM** + **PostgreSQL** | Porta: **4000**  
Docs Swagger: `GET /swagger/*any`

## Padrão de Camadas

```
Handler → Service → Repository → DB
```

Cada módulo em `internal/<domínio>/` contém: `model.go`, `handler.go`, `service.go`, `repository.go`.  
Exceção: `log` não tem handler próprio (escrita via `AuditMiddleware`).

---

## Módulos

### auth
- Rotas: `POST /login` (pública), `GET /api/profile` (guard: `AuthMiddleware`)
- `LoginHandler` → gera JWT site com `{ id: uint, sub: email }`
- `ProfileHandler` → lê `userNumber` do contexto Gin, retorna `{ user_number, email, name, presence_rate }`
- Depende de: `user.UserService`

### authBackoffice
- Rota: `POST /admin/login` (pública)
- Autentica admin → busca permissões → retorna `{ message, user, permissions[], token }`
- Se sem permissões: `message = "Login realizado, mas você não possui permissões"`
- Depende de: `userBackoffice`, `permission`

### user
- Rotas públicas: `POST /register`, `POST /forgot-password`, `POST /reset-password`, `POST /verify-email`, `POST /resend-verification`
- Rotas backoffice: `GET/POST /admin/users`, `GET/PUT/DELETE /admin/users/:id`
- Expõe `SafeUser` (sem `PasswordHash`) | `UserNumber` formatado como `%05d`
- Campo `email_verified bool` — novos usuários nascem `false`; grandfathered via migration
- `PapfeDocument` — entidade associada ao usuário (documentos)
- Depende de: `token`, `mailer`, `providers`

### userBackoffice
- Rotas backoffice: `GET/POST /admin/usersBackoffice`, `GET/PUT/DELETE /admin/usersBackoffice/:email`
- Tabela: `users_backoffice` | PK: `email`
- `InitializeAdmin()` — cria admin padrão (`ADMIN_EMAIL` env) na startup
- Quando cria usuário backoffice: chama `permission.SeedUserPermissions` automaticamente

### event
- Rotas públicas: `GET /events` (paginado), `GET /event/:eventName/:initDate`
- Rotas backoffice: `POST /admin/events`, `PUT/DELETE /admin/events/:eventName/:initDate`
- PK composta: `Name + InitDate` (RFC3339)
- Campos de inscrição: `has_signin bool` (habilita inscrição), `max_participants uint` (0 = sem limite)

### signinEvent
- Rotas autenticadas (`/api`, guard: `AuthMiddleware` + `pageMW("profile","cronograma")`):
  - `POST /api/signin-events` — inscreve usuário (handler: `CreateSignin`)
  - `GET /api/signin-events` — lista eventos com `has_signin=true` (handler: `GetSigninEvents`)
  - `GET /api/signin-events/me` — lista inscrições ativas do usuário (handler: `GetMySignins`)
  - `DELETE /api/signin-events/:eventName/:eventInitDate` — cancela inscrição (handler: `DeleteSignin`)
- Lógica de fila: se vagas esgotadas (`max_participants > 0`), insere com `StatusWaitListed` e calcula posição; cancelamento de inscrito confirmado promove primeiro da lista de espera
- Repository: `Create`, `GetByUserEventAndInitDate`, `CountByStatus`, `CountActiveByEvent`, `FindActiveByUser`, `UpdateStatus`, `GetFirstWaitListed`, `PromoteToRegistered`

### presence
- Rotas backoffice: `GET/POST /admin/presences`, `GET/PUT/DELETE /admin/presences/:userNumber/:eventName/:eventInitDate`
- PK tripla: `UserNumber + EventName + EventInitDate`

### section
- Rotas backoffice: `GET/POST /admin/sections`, `GET/PUT/DELETE /admin/sections/:sectionName`
- `InitializeSections()` — seeds de seções padrão na startup

### permission
- Rotas backoffice: `GET /admin/permissions`, `GET /admin/permissions/me`, `GET /admin/permissions/section/:section`, `POST /admin/permissions`, `PUT/DELETE /admin/permissions/:user/:section`
- `GetMyPermissions` — email lido do JWT, sem URL param
- `InitializePermissions()` — concede `RW` em todas as 7 seções ao admin padrão
- → Detalhes: [[Feature_Controle_Backend]]

### product
- Rotas públicas: `GET /products` (paginado)
- Rotas backoffice: `GET/POST /admin/products`, `GET/PUT/DELETE /admin/products/:id`
- Hierarquia: `Product` base + especialização `Kit` / `Coffee` / `ComboItem`
- `InitializeProducts()` — seeds na startup
- Deleção bloqueada se produto é item de combo (409)

### payment
- Rotas públicas: `POST /webhook/mercadopago`
- Rotas protegidas (`/api`): `GET /api/payments`, `POST /api/payments/pix`, `GET /api/payments/:id/status`
- Integração Mercado Pago: cria PIX (QR code + copia-e-cola), recebe webhook para atualizar status
- → Detalhes: [[Feature_Loja_e_Pagamentos]]

### pages
- Rotas públicas: `GET /pages/availability`, `GET /pages/:page/availability`
- Rota backoffice: `PUT /admin/pages/:page/availability`
- Estado in-memory — reiniciar servidor reseta para `available: true`
- Inicializado com: `["home", "login", "cronograma", "profile", "riddle", "loja"]`
- → Detalhes: [[Feature_Flags_e_Pages]]

### token
- Sem handler HTTP — usado internamente por `user`
- Tabela `tokens`: armazena hash SHA-256 de tokens de email e reset de senha
- Tipos: `email_verification` e `password_reset`
- → Detalhes: [[Feature_Email_e_Tokens]]

### mailer
- Sem handler HTTP — usado por `user` para enviar emails
- Config via env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `FRONTEND_URL`

### log
- Sem handler próprio — escrita via `AuditMiddleware` em toda requisição
- Registra: method, path, status, latency, userNumber, userEmail, responseMessage

### middleware
- `AuthMiddleware` — valida JWT site → injeta `userNumber(uint)` + `email(string)`
- `AuthBackofficeMiddleware` — valida JWT backoffice → injeta `email(string)`
- `RequirePermission(section, level)` — 403 se insuficiente, deve rodar após AuthBackoffice
- `RequirePageAvailable(pagesService, page)` — 503 se página desabilitada
- `AuditMiddleware` — logging automático de todas as requisições

### providers
- `JWTProvider` — `Generate(site)` / `Parse` / `GenerateToBackoffice` / `ParseToBackoffice`
- `BcryptProvider` — hash e compare de senha
- `TokenProvider` — geração de tokens seguros (SHA-256)
- `MailProvider`, `EmailValidationProvider`

---

## Sequência de Startup (main.go)

1. Conecta DB + `AutoMigrate` (User, PapfeDocument, Event, Presence, SigninEvent, UserBackoffice, AuditLog, Permission, Product, Kit, Coffee, ComboItem, Token, Payment, Sponsor, SponsorPackage, SiteStat)
2. Grandfather de `email_verified = true` para usuários existentes (se coluna era nova)
3. Instancia providers + repos + services + handlers
4. `userBackofficeService.InitializeAdmin()`
5. `permissionService.InitializePermissions()`
6. `productService.InitializeProducts()`
7. Registra rotas + CORS + `AuditMiddleware`
8. `r.Run(":4000")`

→ Rotas site: [[Integracao_API_Site]] | Rotas backoffice: [[Integracao_API_Backoffice]]  
→ Entidades core: [[Backend_Modelos_Core]] | Entidades loja: [[Backend_Modelos_Loja]]
