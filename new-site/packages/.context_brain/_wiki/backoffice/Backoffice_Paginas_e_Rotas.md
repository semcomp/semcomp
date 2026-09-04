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
| `/sponsors` | `pages/Sponsors/index.tsx` | RequireAuth + RequirePermission | `"Patrocinadores"` |
| `/papfe-documents` | `pages/PapfeDocuments/index.tsx` | RequireAuth + RequirePermission | `"PAPFE"` |
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

## Sponsors (`/sponsors`)
Arquivo: `pages/Sponsors/index.tsx`

- CRUD completo de `Sponsor` (CNPJ, Nome, Website, Logo) via `sponsorsAPI`
- Upload de logo via multipart form-data; logo servida em `/uploads/`
- Gestão de `SponsorPackage` (Year + Package) dentro da mesma página
- `canWrite = useHasPermission("Patrocinadores", "RW")`
- → [[Feature_Patrocinadores]]

## PapfeDocuments (`/papfe-documents`)
Arquivo: `pages/PapfeDocuments/index.tsx`

- Lista documentos PAPFE enviados por participantes via `papfeAPI` (importado de `api/users.ts`)
- Exibe status tri-state: Pendente / Aprovado / Rejeitado (badge colorido)
- Botão "Visualizar" abre o arquivo em dialog; botão de aprovação/rejeição chama `PUT .../papfe-document/approval`
- `canWrite = useHasPermission("PAPFE", "RW")`
- → [[Feature_PAPFE]]

## PagesAvailability (`/pages-availability`)
Arquivo: `pages/PagesAvailability/index.tsx`

- Lista todas as páginas via `pagesAPI.getAll()`
- Toggle switch por linha — salva em tempo real via `PUT /admin/pages/:page/availability`
- Otimistic update: reverte ao estado anterior em caso de erro
- `canWrite = useHasPermission("Páginas", "RW")`
- → [[Feature_Flags_e_Pages]]
