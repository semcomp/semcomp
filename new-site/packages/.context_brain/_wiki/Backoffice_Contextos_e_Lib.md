---
type: wiki-frontend
tags: [frontend, backoffice, react, auth, context, tabs]
---
# Backoffice — Contextos e Libs

Pacote: `packages/front-backoffice/src/`

## AuthContext
Arquivo: `src/contexts/AuthContext.tsx`  
→ Ver [[Front_Hooks_e_Estados#AuthContext_Backoffice]]

- Storage: `semcomp-backoffice-auth` (user JSON) + `semcomp-backoffice-token` (JWT)
- `isAuthenticated`: `user !== null && !!localStorage.getItem("semcomp-backoffice-token")`
- `login(email, pw)` → `POST /admin/login` → salva token → `navigate("/home", { replace: true })`
- `logout()` → remove `user` + `token` → `navigate("/login", { replace: true })`
- `user.name`: derivado do email (`email.split("@")[0]`) — não vem do backend
- `useAuth()` exportado diretamente deste arquivo (não é arquivo separado)

## RequireAuth
Arquivo: `src/lib/RequireAuth.tsx`  
Guard de rota Outlet: redireciona para `/login` se `!isAuthenticated`.

## API Client
Arquivo: `src/api/client.ts`  
- `baseURL`: `BASEURL` (`src/constants/ApiURL.ts`, toggled por `DEBUGMODE`)
- Interceptor request: `Authorization: Bearer <token>` do `localStorage["semcomp-backoffice-token"]`
- Interceptor response sucesso: normaliza e salva novo token (remove `"Bearer "` duplicado)
- Interceptor response erro 401: `localStorage.removeItem("semcomp-backoffice-token")` + `window.location.href = "/admin/login"`

## Tabs — Navegação do Backoffice
Arquivo: `src/constants/Tabs.ts`  
Define os 6 módulos de CRUD exibidos como cards na Home do backoffice:

| key | Label | Rota | Ícone Lucide |
|---|---|---|---|
| `sections` | Seções | `/sections` | Search |
| `events` | Eventos | `/events` | Calendar |
| `backoffice-users` | Usuários Backoffice | `/backoffice-users` | UserCog |
| `users-semcomp` | Usuários Semcomp | `/semcomp-users` | User |
| `participation` | Participações | `/participation` | Hand |
| `permissions` | Permissões | `/permissions` | Key |

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
| `client` | `api/client.ts` | instância Axios |

⚠️ **`permissionsAPI` ausente** — página `/permissions` usa mock.  
→ Ver todos os endpoints detalhados em [[Integracao_API]]
