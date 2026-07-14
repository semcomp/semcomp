---
type: wiki-integration
tags: [api, integration, frontend, backend, axios, rest]
---
# Integração API — Front ↔ Backend

Base URL (dev): `http://localhost:4000` | Base URL (prod): `https://semcomp.icmc.usp.br/api`  
CORS permitido: `localhost:5173`, `localhost:5174`, `semcomp.icmc.usp.br`  
Toggle: `front-*/src/constants/DebugMode.ts` → `DEBUGMODE`

---

## Clientes Axios

### Site Client
Arquivo: `front-site/src/api/client.ts`  
Storage key: `semcomp-site-token`  
Interceptor request: injeta `Authorization: Bearer <token>`  
Interceptor response: armazena token renovado se `response.headers.authorization` presente

### Backoffice Client
Arquivo: `front-backoffice/src/api/client.ts`  
Storage key: `semcomp-backoffice-token`  
Interceptor request: injeta `Authorization: Bearer <token>`  
Interceptor response (erro): em **401** → `localStorage.removeItem("semcomp-backoffice-token")` + `window.location.href = "/admin/login"`  
Interceptor response (sucesso): normaliza token renovado (remove prefixo `"Bearer "` duplicado)

---

## Rotas Públicas

### POST /login
- **Front**: `front-site/src/api/auth.ts` → `authAPI.login(email, pw)`
- **Backend**: `internal/auth/handler.go` → `LoginHandler`
- Payload: `{ email: string, password: string }`
- Resposta: `{ message: string, user: SafeUser, token: string }`
- Usado em: [[Front_Hooks_e_Estados#AuthContext_Site]] → redireciona para `/profile`

### POST /register
- **Front**: `front-site/src/api/auth.ts` → `authAPI.register(name, email, pw)`
- **Backend**: `internal/user/handler.go` → `CreateUser`
- Payload: `{ name, email, password }`
- Resposta: `{ message: string, user: SafeUser }`
- Erro 409: email já cadastrado

### GET /events
- **Front (site)**: `front-site/src/api/events.ts` → `eventsAPI.getAllEvents()` (envia `limit=1000`)
- **Front (backoffice)**: `front-backoffice/src/api/events.ts` → `eventsAPI.getAll(page, limit, sortBy, ...)`
- **Backend**: `internal/event/handler.go` → `GetEvents`
- Query params: `page, limit, sort_by, sort_order, search_by, search_value`
- Resposta: `{ page, limit, total_records, filtered_records, events: Event[] }`
- Entidade: [[Backend_Models#Event]]

### GET /event/:eventName/:initDate
- **Front (site)**: `eventsAPI.getEventByNameAndDate(name, initDate)`
- **Front (backoffice)**: `eventsAPI.getByNameAndDate(name, initDate)`
- **Backend**: `GetEventByNameAndInitDate`
- Ambos os parâmetros são `encodeURIComponent`-ados no front

---

## Rota Protegida — Site (guard: AuthMiddleware)

### GET /api/profile
- **Front**: `front-site/src/api/auth.ts` → `authAPI.getProfile()`
- **Backend**: `internal/auth/handler.go` → `ProfileHandler`
- Guard: `AuthMiddleware` → lê `userNumber` do contexto Gin
- Resposta: `{ message, user_number: uint, email, name, presence_rate: float64 }`
- Usado na página [[Front_Paginas_e_Rotas#Profile]]

---

## Rota Admin Pública

### POST /admin/login
- **Front**: `front-backoffice/src/api/auth.ts` → `authAPI.login(email, pw)`
- **Backend**: `internal/authBackoffice/handler.go` → `LoginBackofficeHandler`
- Payload: `{ email: string, password: string }`
- Resposta: `{ message: string, user: SafeUserB, permissions: BackofficePermission[], token: string }`
- `permissions` é salvo no `AuthContext` (state + `localStorage["semcomp-backoffice-permissions"]`) e usado para guards de rota e filtragem de cards na Home
- Usado em: [[Backoffice_Contextos_e_Lib#AuthContext]] → redireciona para `/home`

---

## Rotas Backoffice (guard: AuthBackofficeMiddleware)

### Events_Backoffice
Arquivo front: `front-backoffice/src/api/events.ts` (export: `eventsAPI`)

| Método | Path | Função front | Handler backend |
|---|---|---|---|
| GET | `/events` | `eventsAPI.getAll(...)` | `GetEvents` |
| GET | `/event/:name/:initDate` | `eventsAPI.getByNameAndDate` | `GetEventByNameAndInitDate` |
| POST | `/admin/events` | `eventsAPI.create(data)` | `CreateEvent` |
| PUT | `/admin/events/:name/:initDate` | `eventsAPI.update(name, date, data)` | `UpdateEventByNameAndInitDate` |
| DELETE | `/admin/events/:name/:initDate` | `eventsAPI.delete(name, date)` | `DeleteEventByNameAndInitDate` |

Entidade: [[Backend_Models#Event]]

### Presences_Backoffice
Arquivo front: `front-backoffice/src/api/participation.ts` (export: `participationAPI`)

| Método | Path | Função front | Handler backend |
|---|---|---|---|
| POST | `/admin/presences` | `participationAPI.create(presence)` | `CreatePresence` |
| GET | `/admin/presences` | `participationAPI.getAll(page, ...)` | `GetPresences` |
| GET | `/admin/presences/:u/:e/:d` | `participationAPI.getByKeys(u,e,d)` | `GetPresenceByUserEventandInitDate` |
| PUT | `/admin/presences/:u/:e/:d` | `participationAPI.update(origU,origE,origD, data)` | `UpdatePresenceByUserEventandInitDate` |
| DELETE | `/admin/presences/:u/:e/:d` | `participationAPI.delete(u,e,d)` | `DeletePresenceByUserEventandInitDate` |
| POST | `/admin/presences` | `participationAPI.createByQRCode(u,e,d,adminEmail)` | `CreatePresence` |

`createByQRCode` — método especializado chamado pela página `QRCodeReader`, monta o payload e chama `POST /admin/presences`  
Entidade: [[Backend_Models#Presence]]

### Sections_Backoffice
Arquivo front: `front-backoffice/src/api/sections.ts` (export: `sectionsAPI`)

| Método | Path | Função front | Handler backend |
|---|---|---|---|
| GET | `/admin/sections` | `sectionsAPI.getAll(page, ...)` | `GetSections` |
| GET | `/admin/sections/:name` | `sectionsAPI.getByName(name)` | `GetSectionByName` |
| POST | `/admin/sections` | `sectionsAPI.create(data)` | `CreateSection` |
| PUT | `/admin/sections/:name` | `sectionsAPI.update(origName, data)` | `UpdateSectionByName` |
| DELETE | `/admin/sections/:name` | `sectionsAPI.delete(name)` | `DeleteSectionByName` |

Entidade: [[Backend_Models#Section]]

### Users_Backoffice (usuários participantes Semcomp)
Arquivo front: `front-backoffice/src/api/users.ts` (export: `userSemcompAPI`)

| Método | Path | Função front | Handler backend |
|---|---|---|---|
| GET | `/admin/users` | `userSemcompAPI.getAll(page, ...)` | `GetAllUsers` |
| GET | `/admin/users/:id` | `userSemcompAPI.getById(id)` | `GetUserByID` |
| POST | `/admin/users` | `userSemcompAPI.create(data)` | `CreateUser` |
| PUT | `/admin/users/:id` | `userSemcompAPI.update(id, data)` | `UpdateUser` |
| DELETE | `/admin/users/:id` | `userSemcompAPI.delete(id)` | `DeleteUser` |

Entidade: [[Backend_Models#User]]

### UsersBackoffice_Backoffice (admins do sistema)
Arquivo front: `front-backoffice/src/api/userBackoffice.ts` (export: `userBackofficeAPI`)

| Método | Path | Função front | Handler backend |
|---|---|---|---|
| GET | `/admin/usersBackoffice` | `userBackofficeAPI.getAll(page, ...)` | `GetAllUsers` |
| GET | `/admin/usersBackoffice/:email` | `userBackofficeAPI.getByEmail(email)` | `GetUserByEmail` |
| POST | `/admin/usersBackoffice` | `userBackofficeAPI.create(data)` | `CreateUser` |
| PUT | `/admin/usersBackoffice/:email` | `userBackofficeAPI.update(email, data)` | `UpdateUser` |
| DELETE | `/admin/usersBackoffice/:email` | `userBackofficeAPI.delete(email)` | `DeleteUser` |

Entidade: [[Backend_Models#UserBackoffice]]

### Permissions_Backoffice
Arquivo front: `front-backoffice/src/api/permissions.ts` (export: `permissionsAPI`)

| Método | Path | Guard backend | Função front | Handler backend |
|---|---|---|---|---|
| GET | `/admin/permissions?page=1&limit=10000` | `PermR "Permissões"` | `permissionsAPI.getAll()` | `GetPermissions` |
| GET | `/admin/permissions/me` | nenhum (JWT apenas) | `permissionsAPI.getMe()` | `GetMyPermissions` |
| GET | `/admin/permissions/section/:section` | `PermR "Permissões"` | *(não exposto no front)* | `GetPermissionBySection` |
| POST | `/admin/permissions` | `PermRW "Permissões"` | `permissionsAPI.create(email, section, type)` | `CreatePermission` |
| PUT | `/admin/permissions/:user/:section` | `PermRW "Permissões"` | `permissionsAPI.update(user, section, ...)` | `UpdatePermissionByUserSection` |
| DELETE | `/admin/permissions/:user/:section` | `PermRW "Permissões"` | `permissionsAPI.remove(user, section)` | `DeletePermissionByUserSection` |

**Notas:**
- `getMe` bate em `/admin/permissions/me` — backend lê o email do JWT, sem URL param; trata 404 como `[]`
- A página `/permissions` usa abordagem **matrix** (usuários × seções), não CrudTable
- Salvar faz diff e chama apenas os endpoints necessários (create/update/remove por seção alterada)
- Tipo: `BackofficePermission = { user_email, section_name, permission_type: "R" | "RW" }` em `src/types/APIResponseType.ts`
- Todas as rotas backoffice (exceto `GET /permissions/me`) têm `RequirePermission` middleware no backend

Entidade: [[Backend_Models#Permission]]  
→ Fluxo completo: [[Feature_Controle_de_Acesso_e_Permissions]]

---

## Mapeamento de Campos (Nomenclatura front ↔ backend)

**Event** — `front-backoffice/src/api/events.ts`:
| Frontend (EventType) | Backend JSON |
|---|---|
| `nameEvent` | `name` |
| `dateInit` | `init_date` (RFC3339) |
| `dateEnd` | `end_date` (RFC3339) |
| `local` | `location` |
| `hasPresence` | `has_attendance` |
| `type` | `type` |
| `description` | `description` |

**Presence** — `front-backoffice/src/api/participation.ts`:
| Frontend (ParticipationType) | Backend JSON |
|---|---|
| `user_number` / `userNumber` | `user_number` |
| `name_event` / `nameEvent` | `event_name` |
| `date_event` / `dateEvent` | `event_init_date` (RFC3339) |
| `user_backoffice` / `userBackoffice` | `email_admin` |

**User (Semcomp)** — `front-backoffice/src/api/users.ts`:
| Frontend (SemcompUserType) | Backend JSON |
|---|---|
| `id` | `user_number` (string) |
| `user_number` | `user_number` |
| `name` | `name` |
| `email` | `email` |
| `presence_rate` | `presence_rate` |

---

## API Barrels

**front-site** (`src/api/index.ts`): exporta apenas `authAPI`, `client`, types  
→ `eventsAPI` é importado diretamente de `@/api/events` nas páginas

**front-backoffice** (`src/api/index.ts`): exporta `authAPI`, `userBackofficeAPI`, `userSemcompAPI`, `eventsAPI`, `sectionsAPI`, `participationAPI`, `permissionsAPI`, `client`, types  
→ `permissionsAPI.getMe()` é o método usado por `refreshPermissions` no `AuthContext`
