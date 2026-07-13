---
type: wiki-frontend
tags: [frontend, backoffice, react, auth, context, tabs]
---
# Backoffice — Contextos e Libs

Pacote: `packages/front-backoffice/src/`

## AuthContext
Arquivo: `src/contexts/AuthContext.tsx`  
→ Ver [[Front_Hooks_e_Estados#AuthContext_Backoffice]]

- Storage: `semcomp-backoffice-auth` (user JSON) + `semcomp-backoffice-token` (JWT) + `semcomp-backoffice-permissions` (permissions JSON)
- `isAuthenticated`: `user !== null && !!localStorage.getItem("semcomp-backoffice-token")`
- `login(email, pw)` → `POST /admin/login` → salva token + permissões → `navigate("/home", { replace: true })`
- `logout()` → remove `user` + `token` + `permissions` → `navigate("/login", { replace: true })`
- `user.name`: derivado do email (`email.split("@")[0]`) — não vem do backend
- `permissions: BackofficePermission[]` — armazenado em state e localStorage; vem da resposta do login
- `refreshPermissions()` → `GET /admin/permissions/me` → atualiza state (backend usa email do JWT; usado após editar próprias permissões)
- `useAuth()` exportado diretamente deste arquivo (não é arquivo separado)
- `useHasPermission(section, level)` exportado deste arquivo → `boolean` síncrono baseado no state

### Hook useHasPermission
```ts
useHasPermission(section: string, level: "R" | "RW"): boolean
```
- `"R"` → satisfeito por entrada com `permission_type` `"R"` ou `"RW"`
- `"RW"` → satisfeito apenas por `"RW"`
- Ausência de entrada → `false`

## RequireAuth
Arquivo: `src/lib/RequireAuth.tsx`  
Guard de rota Outlet: redireciona para `/login` se `!isAuthenticated`.

## RequirePermission
Arquivo: `src/lib/RequirePermission.tsx`  
Guard de rota por seção: recebe prop `section` (valor de `KnownSections`) e redireciona para `/home` se `useHasPermission(section, "R")` retornar falso.  
Implementado como `<Outlet />` do React Router — todas as rotas CRUD estão envolvidas por ele em `Routes.tsx`.  
→ Ver [[Feature_Controle_de_Acesso_e_Permissions#Fluxo_Completo_no_Frontend]]

## CrudTable — Modo Leitura
Arquivo: `src/components/CrudTable.tsx`  
Prop `canWrite?: boolean` (default `true`) controla a visibilidade dos controles de escrita:
- `false` → oculta botão "Novo {entityLabel}", botão Editar e botão Excluir de cada linha
- Cada página CRUD passa `canWrite={useHasPermission("<seção>", "RW")}` para refletir o nível real do admin logado

→ Ver [[Feature_Controle_de_Acesso_e_Permissions#CrudTable_—_Modo_Leitura_por_Permissão]]

## API Client
Arquivo: `src/api/client.ts`  
- `baseURL`: `BASEURL` (`src/constants/ApiURL.ts`, toggled por `DEBUGMODE`)
- Interceptor request: `Authorization: Bearer <token>` do `localStorage["semcomp-backoffice-token"]`
- Interceptor response sucesso: normaliza e salva novo token (remove `"Bearer "` duplicado)
- Interceptor response erro 401: `localStorage.removeItem("semcomp-backoffice-token")` + `window.location.href = "/admin/login"`

## Tabs — Navegação do Backoffice
Arquivo: `src/constants/Tabs.tsx`  
Define os módulos exibidos como cards na Home do backoffice.  
**Os cards são filtrados por permissão** — apenas seções com pelo menos `"R"` aparecem para o usuário.

| key | section (KnownSections) | Label | Rota | Ícone Lucide |
|---|---|---|---|---|
| `events` | `"Eventos"` | Eventos | `/events` | Calendar |
| `backoffice-users` | `"Usuários Backoffice"` | Usuários Backoffice | `/backoffice-users` | UserCog |
| `users-semcomp` | `"Usuários Semcomp"` | Usuários Semcomp | `/semcomp-users` | User |
| `participation` | `"Participações"` | Participações | `/participation` | Hand |
| `permissions` | `"Permissões"` | Permissões | `/permissions` | Key |

> A aba `sections` foi removida — seções deixaram de ser uma entidade gerenciável.  
> O campo `section` deve estar em sync com `KnownSections` em `backend/internal/permission/model.go` (atualmente 5 seções — sem `"Seções"`).  
> Cada tab também carrega campos `description`, `bg` e `hoverBg` usados no componente de card na Home.

## API Barrel
Arquivo: `src/api/index.ts`  
Exports disponíveis:

| Export | Arquivo | Endpoints |
|---|---|---|
| `authAPI` | `api/auth.ts` | `POST /admin/login` |
| `eventsAPI` | `api/events.ts` | GET/POST/PUT/DELETE events |
| `sectionsAPI` | `api/sections.ts` | CRUD `/admin/sections` |
| `participationAPI` | `api/participation.ts` | CRUD `/admin/presences` + `createByQRCode` |
| `userBackofficeAPI` | `api/userBackoffice.ts` | CRUD `/admin/usersBackoffice` |
| `userSemcompAPI` | `api/users.ts` | CRUD `/admin/users` |
| `permissionsAPI` | `api/permissions.ts` | `getAll`, `getMe`, `create`, `update`, `remove` |
| `client` | `api/client.ts` | instância Axios |

→ Ver todos os endpoints detalhados em [[Integracao_API]]  
→ Tipo `BackofficePermission` definido em `src/types/APIResponseType.ts` (re-exportado por `api/permissions.ts`)
