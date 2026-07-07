---
type: wiki-architecture
tags: [architecture, backend, golang, gin, gorm]
---
# Arquitetura Backend

Entrypoint: `backend/cmd/api/main.go`  
Framework: **Gin** (HTTP) + **GORM** (ORM) + **PostgreSQL** | Porta: **4000**

## Padrão de Camadas

```
Handler → Service → Repository → DB
```

Cada módulo em `internal/<domínio>/` contém: `model.go`, `handler.go`, `service.go`, `repository.go`.  
Exceção: `log` não tem handler próprio (escrita via `AuditMiddleware`).

---

## Módulos

### auth
- Arquivo: `internal/auth/handler.go`
- Rotas: `POST /login` (pública), `GET /api/profile` (guard: `AuthMiddleware`)
- `LoginHandler`: valida credenciais, gera JWT site via `providers.JWTProvider.Generate`
- `ProfileHandler`: lê `userNumber` injetado pelo middleware, retorna `{ user_number, email, name, presence_rate }`
- Depende de: `internal/user.UserService`
- Entidade: [[Backend_Models#LoginUserRequest]] | JWT Claims: `id(uint) + sub(email)`

### authBackoffice
- Arquivo: `internal/authBackoffice/handler.go`
- Rota: `POST /admin/login` (pública)
- `LoginBackofficeHandler`: autentica admin → busca permissões do usuário via `permissionService.GetPermissionByUser` → retorna tudo junto
- Resposta: `{ message, user: SafeUserB, permissions: []Permission, token }`
- Se admin não tem permissões: retorna com `message = "Login realizado, mas você não possui permissões"`
- Depende de: `internal/userBackoffice`, `internal/permission`

### user
- Arquivo: `internal/user/handler.go`
- Rotas públicas: `POST /register`
- Rotas backoffice: `GET/POST /admin/users`, `GET/PUT/DELETE /admin/users/:id`
- Expõe `SafeUser` (sem `PasswordHash`) | `UserNumber` formatado como string com 5 dígitos (`%05d`)
- Entidade: [[Backend_Models#User]]

### userBackoffice
- Arquivo: `internal/userBackoffice/handler.go`
- Rotas backoffice: `GET/POST /admin/usersBackoffice`, `GET/PUT/DELETE /admin/usersBackoffice/:email`
- Entidade: [[Backend_Models#UserBackoffice]] | Tabela DB: `users_backoffice`
- Inicializa admin padrão na startup: `InitializeAdmin()`

### event
- Arquivo: `internal/event/handler.go`
- Rotas públicas: `GET /events` (paginado), `GET /event/:eventName/:initDate`
- Rotas backoffice: `POST /admin/events`, `PUT/DELETE /admin/events/:eventName/:initDate`
- Entidade: [[Backend_Models#Event]] | PK composta: `Name + InitDate` (RFC3339)

### presence
- Arquivo: `internal/presence/handler.go`
- Rotas backoffice: `POST/GET /admin/presences`, `GET/PUT/DELETE /admin/presences/:userNumber/:eventName/:eventInitDate`
- PK tripla: `UserNumber + EventName + EventInitDate`
- Entidade: [[Backend_Models#Presence]] | Liga [[Backend_Models#User]] ↔ [[Backend_Models#Event]]

### section
- Arquivo: `internal/section/handler.go`
- Rotas backoffice: `GET/POST /admin/sections`, `GET/PUT/DELETE /admin/sections/:sectionName`
- Entidade: [[Backend_Models#Section]]
- `InitializeSections()` — seeds de seções padrão na startup

### permission
- Arquivo: `internal/permission/handler.go`
- Rotas backoffice: `GET/POST /admin/permissions`, `GET /admin/permissions/user/:user`, `GET /admin/permissions/section/:section`, `PUT/DELETE /admin/permissions/:user/:section`
- Handler valida existência da seção e do usuário backoffice antes de criar/atualizar
- Valida `PermissionType ∈ {"R", "RW"}` no handler
- Entidade: [[Backend_Models#Permission]]
- `InitializePermissions()` — inicializa permissões do admin padrão na startup

### log
- Arquivos: `internal/log/model.go` + `internal/log/repository.go` + `internal/log/service.go`
- Sem handler HTTP próprio — escrita feita pelo `middleware.AuditMiddleware`
- `AuditMiddleware` registra: method, path, status, latency, userNumber, userEmail, responseMessage
- Entidade: [[Backend_Models#AuditLog]]

### middleware
- `middleware/auth.go`:
  - `AuthMiddleware`: valida Bearer JWT site → injeta `userNumber(uint)` + `email(string)` no contexto Gin
  - `AuthBackofficeMiddleware`: valida Bearer JWT backoffice → injeta apenas `email(string)`
- Ambos retornam 401 se token ausente/inválido

### providers
- `providers/jwt_provider.go` — interface `JWTProvider` com 4 métodos: `Generate`, `Parse`, `GenerateToBackoffice`, `ParseToBackoffice`
- Tokens HS256 | TTL: `JWT_EXPIRES_IN_HOURS` (default 24h) | Secret: `JWT_SECRET` env var
- `providers/bcrypt_provider.go` — hash e compare de senha

### database
- `internal/database/connection.go` — PostgreSQL via env vars
- AutoMigrate executado no startup: `User`, `Event`, `Presence`, `Section`, `UserBackoffice`, `AuditLog`, `Permission`

---

## Sequência de Startup (main.go)

1. Conecta DB e executa AutoMigrate
2. Instancia providers (bcrypt, JWT)
3. Instancia todas as camadas repo → service → handler para cada domínio
4. `sectionService.InitializeSections()` — seeds de seções
5. `userBackofficeService.InitializeAdmin()` — cria admin padrão se não existe
6. `permissionService.InitializePermissions()` — concede permissões ao admin padrão
7. Registra rotas + CORS + `AuditMiddleware` global
8. `r.Run(":4000")`

---

## Grupos de Rotas (main.go) — Tabela Completa

| Grupo | Guard | Prefixo | Handlers registrados |
|---|---|---|---|
| Público | — | `/` | `POST /register`, `POST /login`, `GET /events`, `GET /event/:eventName/:initDate` |
| Site autenticado | `AuthMiddleware` | `/api` | `GET /api/profile` |
| Admin público | — | `/admin` | `POST /admin/login` |
| Backoffice | `AuthBackofficeMiddleware` | `/admin/` | users, events, presences, sections, usersBackoffice, permissions |

→ Mapeamento detalhado endpoint por endpoint: [[Integracao_API]]
