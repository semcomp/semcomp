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

### presence
- Rotas backoffice: `GET/POST /admin/presences`, `GET/PUT/DELETE /admin/presences/:userNumber/:eventName/:eventInitDate`
- PK tripla: `UserNumber + EventName + EventInitDate`

### section
- Rotas backoffice: `GET/POST /admin/sections`, `GET/PUT/DELETE /admin/sections/:sectionName`
- `InitializeSections()` — seeds de seções padrão na startup

### permission
- Rotas backoffice: `GET /admin/permissions`, `GET /admin/permissions/me`, `GET /admin/permissions/section/:section`, `POST /admin/permissions`, `PUT/DELETE /admin/permissions/:user/:section`
- `GetMyPermissions` — email lido do JWT, sem URL param
- `InitializePermissions()` — concede `RW` em todas as 9 seções ao admin padrão
- → Detalhes: [[Feature_Controle_Backend]]

### product
- Rotas públicas: `GET /products` (paginado)
- Rotas backoffice: `GET/POST /admin/products`, `GET/PUT/DELETE /admin/products/:id`
- Hierarquia: `Product` base + especialização `Kit` / `Coffee` / `ComboItem`
- `InitializeProducts()` — seeds na startup
- Deleção bloqueada se produto é item de combo (409)
- Kit usa `IsBabylook` (não `IsBabydoll`); migração dropa a coluna órfã `kits.is_babydoll` na startup

### sales
- Rotas site (`/api`, guard `AuthMiddleware` + `pageMW("loja")`):
  - `POST /api/sales` (CreateSale), `GET /api/sales/profile` (GetMySales), `GET /api/sales/consumed` (GetConsumed), `GET /api/sales/:id` (GetSaleByID)
  - Alias legado: `POST /api/payments/pix` → `CreateSale`, `GET /api/payments/:id/status` → `GetSaleStatus`
- Rotas backoffice (`/admin`, seção `"Vendas"`): `GET /admin/sales` (PermR), `PUT/DELETE /admin/sales/:id` (PermRW), `PATCH /admin/sales/items/:itemId/pickup` (PermRW)
- Status da venda: `PENDENTE | PAGO | REJEITADO | CANCELADO | REEMBOLSADO | EXPIRADO` (check `status_chk`; `EXPIRADO` é persistido pelo sweeper)
- **Compra única**: trava `consumed_items` (COFFEE/COMBO) na criação; fechamento via combos (`getUnavailableProductIDs`); sincroniza travas em toda mudança de status (webhook, update, delete)
- → Detalhes: [[Feature_Loja_e_Pagamentos]]

### payment (integrado ao sales)
- Não existe mais o pacote `internal/payment` — a integração Mercado Pago (PIX) vive em `internal/sales`; a venda carrega os campos `MercadoPagoID`/`QRCode`/`PixExpiration`.
- Rotas legadas mantidas (apontam para `salesHandler`):
  - `POST /api/payments/pix` → `CreateSale` (cria venda PENDENTE + cobrança PIX)
  - `GET /api/payments/:id/status` → `GetSaleStatus`
- Webhook público: `POST /webhook/mercadopago` → `salesHandler.Webhook`
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

1. Conecta DB + `AutoMigrate` (inclui `Product`, `Kit`, `Coffee`, `ComboItem`, `Sale`, `SaleItem`, `ConsumedItem`, `Token`, `Sponsor`, `SiteStat`, …)
2. Migrações manuais pós-AutoMigrate:
   - dropa a coluna órfã `kits.is_babydoll` (modelo usa `is_babylook`)
   - recria `sales.status_chk` aceitando `EXPIRADO` (AutoMigrate não altera CHECK existente)
3. Grandfather de `email_verified = true` para usuários existentes (se coluna era nova)
4. Instancia providers + repos + services + handlers
5. `userBackofficeService.InitializeAdmin()`
6. `permissionService.InitializePermissions()`
7. `productService.InitializeProducts()`
8. **Sweeper de expiração** (goroutine, ticker 1 min): `ExpirePendingPixSales()` persiste `EXPIRADO` (via `UPDATE ... RETURNING`) e, para cada venda expirada, `DeleteConsumedBySale` libera as travas de compra única
9. Registra rotas + CORS + `AuditMiddleware`
10. `r.Run(":4000")`

→ Rotas site: [[Integracao_API_Site]] | Rotas backoffice: [[Integracao_API_Backoffice]]  
→ Entidades core: [[Backend_Modelos_Core]] | Entidades loja: [[Backend_Modelos_Loja]]
