---
type: feature-flow
tags: [feature, rbac, permissions, backoffice, acesso]
---
# Funcionalidade: Controle de Acesso e Permissões

RBAC simples por seção. Admins (`UserBackoffice`) recebem `"R"` ou `"RW"` por `Section`.  
Integração backend ↔ frontend **totalmente implementada** — RBAC aplicado tanto no backend (middleware) quanto no frontend (guard de rota).

---

## Modelo de Permissão

Struct: [[Backend_Models#Permission]]  
Chave composta: `UserEmail (FK → users_backoffice) + SectionName (string — sem FK)`

| Campo | Valores | Semântica |
|---|---|---|
| `permission_type` | `"R"` | leitura somente |
| `permission_type` | `"RW"` | leitura e escrita |

> Ausência de linha no banco = sem acesso (não existe valor `"none"` persistido).

### Tipos de nível (`permission/model.go`)
```go
type PermissionLevel string
const (
    PermR  PermissionLevel = "R"
    PermRW PermissionLevel = "RW"
)
func HasLevel(actual, required PermissionLevel) bool
```
`HasLevel` usa `levelOrder` map para comparação ordinal (`PermR=1`, `PermRW=2`).

### 5 Seções Padrão (definidas em código)
Definidas em `permission/model.go → KnownSections`.  
**O campo `section` em `Tabs.tsx` deve sempre estar em sync com esta lista.**

| Seção (`section_name`) | Tab no front | Rota |
|---|---|---|
| `"Eventos"` | Eventos | `/events` |
| `"Usuários Backoffice"` | Usuários Backoffice | `/backoffice-users` |
| `"Usuários Semcomp"` | Usuários Semcomp | `/semcomp-users` |
| `"Participações"` | Participações | `/participation` |
| `"Permissões"` | Permissões | `/permissions` |

Admin padrão (via `ADMIN_EMAIL` env) recebe `"RW"` em todas as 5 via `InitializePermissions()` na startup.

---

## RBAC no Backend (middleware)

Arquivo: `internal/middleware/permission.go`  
`RequirePermission(permSvc, section, required)` retorna um `gin.HandlerFunc`:
- Lê `email` do contexto Gin (injetado por `AuthBackofficeMiddleware`)
- Chama `permSvc.CheckPermission(email, section, required)` → 403 se insuficiente, 401 se email ausente
- Registrado em `main.go` como helper `permMW(section, level)` e aplicado em todas as rotas admin (exceto `GET /permissions/me`)

`CheckPermission` no service (`internal/permission/service.go`) usa `HasLevel(actual, required)` para comparação ordinal.

## Validações no Handler Go

Arquivo: `internal/permission/handler.go`  
Antes de `CreatePermission` e `UpdatePermissionByUserSection`, o handler valida:

1. `slices.Contains(KnownSections, request.SectionName)` → 400 se seção não está na lista
2. `userBackofficeService.GetUserByEmail(request.UserEmail)` → 400 se admin inexistente
3. `request.PermissionType ∈ {"R", "RW"}` → 400 se valor inválido

`GetMyPermissions` — lê email de `c.MustGet("email")`, sem URL param. Não exige permissão especial (qualquer admin autenticado pode consultar as próprias permissões).

---

## Retorno no Login

`POST /admin/login` retorna `permissions[]` junto com o token:
```json
{
  "message": "Login realizado",
  "user": { "email": "..." },
  "permissions": [{ "user_email": "...", "section_name": "Eventos", "permission_type": "RW" }],
  "token": "..."
}
```
O front armazena esse array no `AuthContext` e em `localStorage` (`semcomp-backoffice-permissions`).  
→ Detalhes em [[Integracao_API#POST_admin_login]]

---

## Fluxo Completo no Frontend

### 1. Login
`authAPI.login(email, pw)` → `POST /admin/login`  
→ `AuthContext` salva `user`, `token` e `permissions[]` nos states e localStorage.

### 2. Guard de Rota (frontend)
`lib/RequirePermission.tsx` — wraps cada rota como Outlet no React Router:
```tsx
<RequirePermission section="Eventos" />
```
- Chama `useHasPermission(section, "R")` (síncrono, usa state do AuthContext)
- Se falso → redireciona para `/home`
- Todas as rotas CRUD estão envolvidas por `RequirePermission` em `routes/Routes.tsx`

O backend também aplica `RequirePermission` middleware (403) para cada endpoint, tornando a proteção dupla.

### 3. Home — Filtragem de Cards
`pages/Home/index.tsx` filtra `Tabs` pelo `permissions` do AuthContext:
```ts
const visibleTabs = Tabs.filter(tab =>
  permissions.some(p => p.section_name === tab.section)
);
```
Usuário sem permissões vê mensagem informativa.

### 4. Hook de Permissão
```ts
// contexts/AuthContext.tsx
export function useHasPermission(section: string, level: "R" | "RW"): boolean
```
- `"R"` → satisfeito por `"R"` **ou** `"RW"`
- `"RW"` → satisfeito apenas por `"RW"`

### 5. CrudTable — Modo Leitura por Permissão
`components/CrudTable.tsx` aceita prop `canWrite?: boolean` (default `true`):
- `canWrite = false` → oculta botão "Novo", ícone Editar e ícone Excluir de cada linha
- `canWrite = true` → comportamento padrão com todos os controles visíveis

Cada página CRUD deriva `canWrite` via hook:
```ts
const canWrite = useHasPermission("<seção>", "RW");
```

| Página | Seção verificada |
|---|---|
| `pages/Events/index.tsx` | `"Eventos"` |
| `pages/UserBackoffice/index.tsx` | `"Usuários Backoffice"` |
| `pages/UserSemcomp/index.tsx` | `"Usuários Semcomp"` |
| `pages/Participation/index.tsx` | `"Participações"` |

Admin com apenas `"R"` vê a tabela em modo leitura. Admin com `"RW"` vê todos os controles.

### 6. Edição de Permissões (página `/permissions`)
`pages/Permission/index.tsx` — abordagem **matrix**:
- Linhas = usuários backoffice (via `GET /admin/usersBackoffice?limit=1000`)
- Colunas = 5 seções fixas (`KnownSections`)
- Células = badge `RW` (verde) / `R` (azul) / `—` (cinza)
- Modal de edição por usuário: um `<Select>` por seção (`—` / `R` / `RW`)
- Salva com diff: só chama API para seções alteradas
- Erros de API exibidos no toast via `err?.response?.data?.error`

| Mudança | Chamada API |
|---|---|
| `—` → `R`/`RW` | `POST /admin/permissions` |
| `R` → `RW` ou `RW` → `R` | `PUT /admin/permissions/:user/:section` |
| `R`/`RW` → `—` | `DELETE /admin/permissions/:user/:section` |

> ⚠️ **Limitação**: o diff é feito com `Promise.all` (N chamadas paralelas). Se uma falhar, as anteriores já foram salvas — sem rollback. O backend não tem operação atômica bulk de permissões.

### 6. Refresh de Permissões Próprias
Se o admin edita as **próprias** permissões:
```ts
if (editTarget.email === user?.email) await refreshPermissions();
```
`refreshPermissions()` chama `GET /admin/permissions/me` (email lido do JWT no backend) e atualiza o state — sem necessidade de logout.

---

## Arquivos Relevantes

### Backend
| Arquivo | Responsabilidade |
|---|---|
| `internal/permission/model.go` | `KnownSections` (5 seções), `PermissionLevel`, `HasLevel`, structs `Permission`, `PermissionRequest` |
| `internal/permission/handler.go` | CRUD handlers com validação; `GetMyPermissions` (lê email do JWT) |
| `internal/permission/service.go` | `InitializePermissions`, `GetPermissionByUser`, `CheckPermission` |
| `internal/permission/repository.go` | Queries GORM |
| `internal/middleware/permission.go` | `RequirePermission` middleware (lê email do JWT, retorna 403 se insuficiente) |
| `internal/authBackoffice/handler.go` | Login retorna `permissions[]` |

### Frontend
| Arquivo | Responsabilidade |
|---|---|
| `src/types/APIResponseType.ts` | Tipo `BackofficePermission` (fonte da verdade) |
| `src/api/permissions.ts` | `permissionsAPI`: `getAll`, `getMe`, `create`, `update`, `remove` |
| `src/contexts/AuthContext.tsx` | State de permissions, `useHasPermission`, `refreshPermissions` (usa `getMe`) |
| `src/lib/RequirePermission.tsx` | Guard de rota por seção (Outlet do React Router) |
| `src/constants/Tabs.tsx` | 5 tabs com campo `section` mapeado para `KnownSections` |
| `src/routes/Routes.tsx` | Todas as rotas CRUD envoltas em `<RequirePermission section="...">` |
| `src/pages/Home/index.tsx` | Cards filtrados por `permissions` |
| `src/components/CrudTable.tsx` | Prop `canWrite` controla visibilidade de criar/editar/excluir |
| `src/pages/Permission/index.tsx` | UI matrix; erros de API exibidos no toast via `err?.response?.data?.error` |

---

## Referências
- Entidade: [[Backend_Models#Permission]], [[Backend_Models#UserBackoffice]]
- Módulo backend: [[Backend_Arquitetura#permission]]
- Navegação: [[Backoffice_Contextos_e_Lib#Tabs]] (`key: "permissions"`, ícone `Key`)
- Endpoints: [[Integracao_API#Permissions_Backoffice]]
- Fluxo de login com permissions: [[Feature_Autenticacao_e_Sessoes#Fluxo_Backoffice]]
