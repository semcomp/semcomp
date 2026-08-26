---
type: wiki-frontend
tags: [frontend, backoffice, contexts, auth, tabs, crudtable]
---
# Backoffice — Contextos, Libs e Componentes

## AuthContext (Backoffice)
Arquivo: `src/contexts/AuthContext.tsx`

| Chave localStorage | Conteúdo |
|---|---|
| `semcomp-backoffice-token` | JWT string |
| `semcomp-backoffice-auth` | JSON do SafeUserB |
| `semcomp-backoffice-permissions` | JSON de `BackofficePermission[]` |

- `login(email, pw)` → `POST /admin/login` → salva token + user + permissions → `navigate("/home", { replace: true })`
- `logout()` → remove todas as 3 chaves + reseta state → `navigate("/login", { replace: true })`
- `isAuthenticated`: `user !== null && !!localStorage.getItem("semcomp-backoffice-token")`
- `user.name`: `email.split("@")[0]` — **não vem do backend**
- `refreshPermissions()` → `GET /admin/permissions/me` → atualiza state (usado após editar próprias permissões)

### Hook useHasPermission
```ts
useHasPermission(section: string, level: "R" | "RW"): boolean
```
- `"R"` → satisfeito por `"R"` **ou** `"RW"`
- `"RW"` → satisfeito apenas por `"RW"`
- Ausência de entrada no array → `false`

Exportado diretamente de `src/contexts/AuthContext.tsx`.

---

## RequireAuth
Arquivo: `src/lib/RequireAuth.tsx`  
Guard de rota Outlet: redireciona para `/login` se `!isAuthenticated`.

## RequirePermission
Arquivo: `src/lib/RequirePermission.tsx`  
Guard de rota por seção: prop `section` → `useHasPermission(section, "R")` → redireciona para `/home` se falso.  
Implementado como `<Outlet />` — envolve cada rota CRUD em `Routes.tsx`.

---

## CrudTable
Arquivo: `src/components/CrudTable.tsx`

Prop `canWrite?: boolean` (default `true`):
- `false` → oculta botão "Novo", Editar e Excluir de cada linha
- Cada página CRUD passa `canWrite={useHasPermission("<seção>", "RW")}`

| Página | Seção verificada |
|---|---|
| `pages/Events/index.tsx` | `"Eventos"` |
| `pages/UserBackoffice/index.tsx` | `"Usuários Backoffice"` |
| `pages/UserSemcomp/index.tsx` | `"Usuários Semcomp"` |
| `pages/Participation/index.tsx` | `"Participações"` |
| `pages/Products/index.tsx` | `"Produtos"` |
| `pages/Sales/index.tsx` | `"Vendas"` |
| `pages/Permission/index.tsx` | matrix customizada (não usa CrudTable) |

### Expansão de linha (texto longo)
CrudTable expande/recolhe **a linha inteira** ao clicar nela (não mais por célula):

- `rowHasExpandableContent(item)`: a linha é clicável se tem `textarea` com mais de 120 chars **ou** texto com mais de 40 chars (campos `url` são excluídos — têm truncate próprio).
- Estado: `expandedRows: Set<string>` chaveado por `resolveItemKey(item)`.
- Colapsado: `line-clamp-2` + `max-w-2xs` (288px) + `whitespace-normal break-words`; expandido: vira `block` (sem clamp) para mostrar o texto completo.
- **Cuidado com `max-w-xs`**: neste projeto compila para `--spacing-xs` = 6px (Tailwind v4.2.2) e empilha os caracteres — usar `max-w-2xs`.
- `block` e `line-clamp-2` são mutuamente exclusivos (o `block` sobrescreve o `display:-webkit-box` exigido pelo clamp).
- Botões de ação (`onAction`/Editar/Excluir) chamam `e.stopPropagation()` para não alternar a linha; linhas expandíveis ganham `cursor-pointer`.

---

## Tabs — Navegação do Backoffice
Arquivo: `src/constants/Tabs.tsx`

**Cards são filtrados por permissão** — apenas seções com ao menos `"R"` aparecem.

| key | section | Label | Rota |
|---|---|---|---|
| `events` | `"Eventos"` | Eventos | `/events` |
| `backoffice-users` | `"Usuários Backoffice"` | Usuários Backoffice | `/backoffice-users` |
| `users-semcomp` | `"Usuários Semcomp"` | Usuários Semcomp | `/semcomp-users` |
| `participation` | `"Participações"` | Participações | `/participation` |
| `permissions` | `"Permissões"` | Permissões | `/permissions` |
| `products` | `"Produtos"` | Produtos | `/products` |
| `pages-availability` | `"Páginas"` | Páginas | `/pages-availability` |
| `sponsors` | `"Patrocinadores"` | Patrocinadores | `/sponsors` |
| `sales` | `"Vendas"` | Vendas | `/sales` |

> O campo `section` em Tabs **deve estar em sync** com `KnownSections` em `backend/internal/permission/model.go` (9 seções: Eventos, Usuários Backoffice, Usuários Semcomp, Participações, Permissões, Produtos, Páginas, Patrocinadores, Vendas).

---

## API Client (Backoffice)
Arquivo: `src/api/client.ts`

- `baseURL`: `BASEURL` de `constants/ApiURL.ts`
- Interceptor request: injeta `Authorization: Bearer <token>` do `localStorage["semcomp-backoffice-token"]`
- Interceptor response (sucesso): normaliza token renovado (remove prefixo `"Bearer "` duplicado)
- Interceptor response (401): `localStorage.removeItem("semcomp-backoffice-token")` + `window.location.href = "/admin/login"` (bypass do React Router)

## API Barrel (Backoffice)
Arquivo: `src/api/index.ts`

| Export | Arquivo | Endpoints |
|---|---|---|
| `authAPI` | `api/auth.ts` | `POST /admin/login` |
| `eventsAPI` | `api/events.ts` | CRUD `/events` + `/admin/events` |
| `sectionsAPI` | `api/sections.ts` | CRUD `/admin/sections` |
| `participationAPI` | `api/participation.ts` | CRUD `/admin/presences` + `createByQRCode` |
| `userBackofficeAPI` | `api/userBackoffice.ts` | CRUD `/admin/usersBackoffice` |
| `userSemcompAPI` | `api/users.ts` | CRUD `/admin/users` |
| `permissionsAPI` | `api/permissions.ts` | `getAll`, `getMe`, `create`, `update`, `remove` |
| `pagesAPI` | `api/pages.ts` | `getAll`, `setAvailability` |
| `productsAPI` | `api/products.ts` | CRUD `/admin/products` + `createCombo`/`updateCombo`/`bulkCreate` |
| `sponsorsAPI` | `api/sponsors.ts` | CRUD `/admin/sponsors` |
| `salesAPI` | `api/sales.ts` | `GET /admin/sales`, `PUT/DELETE /admin/sales/:id`, `PATCH /admin/sales/items/:itemId/pickup` |
| `client` | `api/client.ts` | instância Axios |

> `userSemcompAPI` (não `usersAPI`) é o nome correto para CRUD de participantes.
