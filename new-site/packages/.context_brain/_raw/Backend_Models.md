---
type: raw-models
tags: [backend, models, golang, gorm, database]
---
# Backend Models

Todas as structs mapeadas pelo GORM. PK = Primary Key, FK = Foreign Key.

---

## User
Arquivo: `backend/internal/user/model.go`  
Tabela: `users`

| Campo | Tipo Go | GORM | JSON |
|---|---|---|---|
| `UserNumber` | `uint` | PK, not null | `user_number` |
| `Name` | `string` | size:100, not null | `name` |
| `Email` | `string` | size:150, unique, not null | `email` |
| `PasswordHash` | `string` | size:255, not null | — (omitido) |
| `PresenceRate` | `float64` | not null | `presence_rate` |

**SafeUser** (exposto pela API): `UserNumber(string,05d)`, `Name`, `Email`, `PresenceRate`  
Relacionamentos: ← [[Backend_Models#Presence]] (via `UserNumber`)

---

## UserBackoffice
Arquivo: `backend/internal/userBackoffice/model.go`  
Tabela: `users_backoffice`

| Campo | Tipo Go | GORM | JSON |
|---|---|---|---|
| `Email` | `string` | PK, size:150, not null | `email` |
| `PasswordHash` | `string` | size:255, not null | — (omitido) |

**SafeUserB**: `Email`  
Relacionamentos: ← [[Backend_Models#Permission]] (via `UserEmail`)

---

## Event
Arquivo: `backend/internal/event/model.go`  
Tabela: `events`

| Campo | Tipo Go | GORM | JSON |
|---|---|---|---|
| `Name` | `string` | PK, size:200, not null | `name` |
| `InitDate` | `time.Time` | PK, timestamptz, not null | `init_date` |
| `EndDate` | `time.Time` | timestamptz, not null | `end_date` |
| `Type` | `string` | size:50 | `type` |
| `Location` | `string` | — | `location` |
| `Description` | `string` | type:text | `description` |
| `HasAttendance` | `bool` | — | `has_attendance` |

**Chave primária composta**: `Name + InitDate`  
Relacionamentos: ← [[Backend_Models#Presence]] (via `EventName + EventInitDate`)

---

## Presence
Arquivo: `backend/internal/presence/model.go`  
Tabela: `presences`

| Campo | Tipo Go | GORM | JSON |
|---|---|---|---|
| `UserNumber` | `int64` | PK, not null | `user_number` |
| `EventName` | `string` | PK, size:200, not null | `event_name` |
| `EventInitDate` | `time.Time` | PK, timestamptz, not null | `event_init_date` |
| `EmailAdmin` | `string` | size:255, not null | `email_admin` |

**Chave primária composta**: `UserNumber + EventName + EventInitDate`  
Relacionamentos: → [[Backend_Models#User]], → [[Backend_Models#Event]], → [[Backend_Models#UserBackoffice]] (via `EmailAdmin`)

---

## Section
Arquivo: `backend/internal/section/model.go`  
Tabela: `sections`

| Campo | Tipo Go | GORM | JSON |
|---|---|---|---|
| `Name` | `string` | PK, size:200, not null | `name` |
| `Description` | `string` | type:text | `description` |

Relacionamentos: ← [[Backend_Models#Permission]] (via `SectionName`)  
Nota: inicializada com valores padrão na startup via `InitializeSections()`

---

## Permission
Arquivo: `backend/internal/permission/model.go`  
Tabela: `permissions`

| Campo | Tipo Go | GORM | JSON |
|---|---|---|---|
| `UserEmail` | `string` | PK, size:150 | `user_email` |
| `SectionName` | `string` | PK, size:200 | `section_name` |
| `PermissionType` | `string` | size:2, not null | `permission_type` |
| `User` | `*UserBackoffice` | FK:UserEmail | omitempty |
| `Section` | `*Section` | FK:SectionName | omitempty |

**Chave primária composta**: `UserEmail + SectionName`  
Valores de `PermissionType`: `"R"` (read) ou `"RW"` (read-write)  
Relacionamentos: → [[Backend_Models#UserBackoffice]], → [[Backend_Models#Section]]

---

## AuditLog
Arquivo: `backend/internal/log/model.go`  
Tabela: `audit_logs`

| Campo | Tipo Go | GORM | Notas |
|---|---|---|---|
| `ID` | `uint` | PK | auto-increment |
| `CreatedAt` | `time.Time` | autoCreateTime | — |
| `UserNumber` | `*uint` | index | nullable |
| `UserEmail` | `*string` | index | nullable |
| `StatusCode` | `int` | index | HTTP status |
| `Message` | `string` | type:text | response message |
| `Method` | `string` | index | GET/POST/... |
| `Path` | `string` | index | endpoint |
| `LatencyMs` | `int64` | — | ms |

Preenchido automaticamente pelo `middleware/log.go` em toda requisição.

---

## Structs de Request (DTOs)

| Struct | Módulo | Usado em |
|---|---|---|
| `LoginUserRequest` | `auth` | `POST /login` (`email`, `password`) |
| `LoginUserBackofficeRequest` | `authBackoffice` | `POST /admin/login` (`email`, `password`) |
| `CreateUserRequest` | `user` | `POST /register`, `POST /admin/users` |
| `UpdateUserRequest` | `user` | `PUT /admin/users/:id` (inclui `presence_rate`) |
| `CreateEventRequest` | `event` | `POST /admin/events` |
| `UpdateEventRequest` | `event` | `PUT /admin/events/:n/:d` |
| `CreatePresenceRequest` | `presence` | `POST /admin/presences` |
| `UpdatePresenceRequest` | `presence` | `PUT /admin/presences/:u/:e/:d` |
| `CreateSectionRequest` | `section` | `POST /admin/sections` |
| `UpdateSectionRequest` | `section` | `PUT /admin/sections/:n` |
| `PermissionRequest` | `permission` | `POST /admin/permissions`, `PUT /admin/permissions/:u/:s` |
| `CreateUserBackofficeRequest` | `userBackoffice` | `POST /admin/usersBackoffice` |
| `UpdateUserBackofficeRequest` | `userBackoffice` | `PUT /admin/usersBackoffice/:email` |

---

## JWT Claims (providers)

### AuthTokenClaims (site)
Arquivo: `internal/providers/jwt_provider.go`
- `UserNumber uint` — `id` no payload JWT
- `Email string` — `sub` no payload JWT
- Injetado no contexto Gin por `AuthMiddleware` como `userNumber` e `email`

### AuthBackofficeTokenClaims (backoffice)
- `Email string` — `sub` no payload JWT
- Injetado no contexto Gin por `AuthBackofficeMiddleware` como `email`

---

## Queries de Listagem (padrão compartilhado)

Todos os módulos com listagem usam struct `<Domínio>ListQuery`:

| Campo | Tipo | Descrição |
|---|---|---|
| `Limit` | `int` | itens por página |
| `Offset` | `int` | calculado como `(page-1)*limit` |
| `SortBy` | `string` | coluna de ordenação |
| `SortOrder` | `string` | `"asc"` ou `"desc"` |
| `SearchBy` | `string` | coluna de busca |
| `SearchValue` | `string` | valor a buscar |

Resposta padrão `<Domínio>ListResult`:
- `Items []<Domínio>` — slice de entidades
- `TotalRecords int64` — total sem filtro
- `FilteredRecords int64` — total após filtro

→ Ver rotas completas em [[Integracao_API]]
