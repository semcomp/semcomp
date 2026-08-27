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
| `/products` | `pages/Products/index.tsx` | RequireAuth + RequirePermission | `"Produtos"` |
| `/pages-availability` | `pages/PagesAvailability/index.tsx` | RequireAuth + RequirePermission | `"Páginas"` |
| `/sponsors` | `pages/Sponsors/index.tsx` | RequireAuth + RequirePermission | `"Patrocinadores"` |
| `/sales` | `pages/Sales/index.tsx` | RequireAuth + RequirePermission | `"Vendas"` |
| `/riddles` | `pages/Riddles/index.tsx` | RequireAuth + RequirePermission | `"Riddles"` |
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

## Products (`/products`)
Arquivo: `pages/Products/index.tsx` (CrudTable sobre `productsAPI`)

- Abas por tipo: `KIT` / `COFFEE` / `COMBO` (configs em `data/productsCrudField.ts`)
- CRUD de kit (inclui variante `is_babylook`), coffee (com `date_time`), combo (itens KIT/COFFEE via `ComboFormModal`)
- `KitBulkModal` — criação em lote de kits por tamanho/cor (+ opção babylook)
- `canWrite = useHasPermission("Produtos", "RW")`

## Sales (`/sales`)
Arquivo: `pages/Sales/index.tsx` (CrudTable sobre `salesAPI`)

- Lista vendas (`GET /admin/sales`), atualiza status (`PUT /admin/sales/:id`), exclui (`DELETE /admin/sales/:id`)
- Retirada de item: `PATCH /admin/sales/items/:itemId/pickup`
- `canWrite = useHasPermission("Vendas", "RW")`

## Riddles (`/riddles`)
Arquivo: `pages/Riddles/index.tsx` (CrudTable sobre `riddlesAPI`)

- CRUD de enigmas (`GET/POST /admin/riddles`, `PUT/DELETE /admin/riddles/:id`)
- Upload de CSV (`POST /admin/riddles/upload-csv`) — substitui toda a fila
- Toggle `is_active` na tabela via campo `interactiveToggle` da CrudTable
- Preview de imagem (`image-preview`) no modal de criar/editar
- `canWrite = useHasPermission("Riddles", "RW")`
- → [[Feature_Riddle_e_Jogo]]
