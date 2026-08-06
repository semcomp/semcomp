---
type: wiki-frontend
tags: [frontend, backoffice, pages, routes, react]
---
# Backoffice — Páginas e Rotas

Pacote: `packages/front-backoffice/src/`  
Porta dev: **5174** | `basename: "/admin"` | Router: React Router v6 (imports estáticos)

## Tabela de Rotas

| Path (relativo a `/admin`) | Componente | Guards | Seção (KnownSection) |
|---|---|---|---|
| `/login` | `pages/Login/index.tsx` | — | — |
| `/home` | `pages/Home/index.tsx` | RequireAuth | — |
| `/events` | `pages/Events/index.tsx` | RequireAuth + RequirePermission | `"Eventos"` |
| `/events/:nameEvent/:datetime/qrcode-reader` | `pages/Events/QRCodeReader/index.tsx` | RequireAuth + RequirePermission | `"Eventos"` |
| `/semcomp-users` | `pages/UserSemcomp/index.tsx` | RequireAuth + RequirePermission | `"Usuários Semcomp"` |
| `/backoffice-users` | `pages/UserBackoffice/index.tsx` | RequireAuth + RequirePermission | `"Usuários Backoffice"` |
| `/participation` | `pages/Participation/index.tsx` | RequireAuth + RequirePermission | `"Participações"` |
| `/permissions` | `pages/Permission/index.tsx` | RequireAuth + RequirePermission | `"Permissões"` |
| `/pages-availability` | `pages/PagesAvailability/index.tsx` | RequireAuth + RequirePermission | `"Páginas"` |
| `*` | `pages/NotFound/index.tsx` | RequireAuth | — |

## Home do Backoffice (`/home`)
Arquivo: `pages/Home/index.tsx` + `constants/Tabs.tsx`

- Exibe cards clicáveis filtrados por permissão do admin logado
- Saudação dinâmica: `Bom dia/Boa tarde/Boa noite, {user.name.split(" ")[0]}`
- `user.name` = `email.split("@")[0]` (derivado do email, não vem do backend)
- Cards sem permissão não são exibidos (filtragem no client via `permissions[]`)

## Guard de Permissão
`RequirePermission` em `src/lib/RequirePermission.tsx` — implementado como Outlet do React Router:
- Recebe prop `section` (valor de `KnownSections`)
- Chama `useHasPermission(section, "R")` — síncrono
- Se falso → `navigate("/home")`

O backend também aplica `RequirePermission` middleware (retorna 403) → proteção dupla.

## QRCodeReader
Rota: `/events/:nameEvent/:datetime/qrcode-reader`  
Navegada a partir de um evento na página `/events`.  
Parâmetros via `useParams()` + fallback de `location.state`.  
→ [[Feature_Participacao_e_QRCode]]

## PagesAvailability (`/pages-availability`)
Arquivo: `pages/PagesAvailability/index.tsx`

- Lista todas as páginas via `pagesAPI.getAll()`
- Toggle switch por linha — salva em tempo real via `PUT /admin/pages/:page/availability`
- Otimistic update: reverte ao estado anterior em caso de erro
- `canWrite = useHasPermission("Páginas", "RW")`
- → [[Feature_Flags_e_Pages]]
