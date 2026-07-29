# front-backoffice

Painel administrativo da Semcomp. React 19 + TypeScript + Vite + Tailwind (shadcn/radix), servido sob o path base `/admin`, rodando em `http://localhost:5174`.

Este README documenta a estrutura de `src/`, as rotas, os contexts/hooks principais e o passo a passo para adicionar uma nova página CRUD. Para a arquitetura do monorepo como um todo (incluindo o backend e o RBAC), veja `../.context_brain/_wiki/`.

## Rodando localmente

```bash
yarn install
yarn dev
```

Abre em `http://localhost:5174/admin/` (o router usa `basename: "/admin"` e o Vite usa `base: '/admin/'`).

A URL da API é resolvida em `src/constants/ApiURL.tsx` via a env var `VITE_DEBUG_MODE`, do mesmo jeito que no `front-site`:

- `VITE_DEBUG_MODE=true` → `http://localhost:4000` (backend local)
- qualquer outro valor (ou ausente) → `https://semcomp.icmc.usp.br/api` (produção)

## Estrutura de `src/`

```
src/
├── api/            # client axios + uma função por domínio (auth, events, users, userBackoffice, sections, participation, permissions, pages)
├── components/     # Header, CrudTable (tabela CRUD genérica reusada por quase toda página), BannerCard, Notification, components/ui (primitivos shadcn)
├── constants/      # ApiURL, Tabs (metadados das seções do menu Home)
├── contexts/       # Auth, Notification (+ hooks useX correspondentes)
├── data/           # *CrudField.ts — definição das colunas/campos de cada CrudTable
├── lib/            # RequireAuth, RequirePermission, utils
├── mock/           # dados mockados (não usados nas páginas já integradas, mantidos p/ referência/dev)
├── pages/          # uma pasta por página, cada uma com index.tsx (ver seção Rotas)
├── routes/         # Routes.tsx — definição do createBrowserRouter
├── types/          # tipos TS compartilhados (EventType, SectionType, BackofficeUserType, CrudItem...)
├── App.tsx         # layout raiz: Header + <Outlet />, dentro dos Providers
└── main.tsx        # bootstrap: StrictMode > RouterProvider
```

Alias de import: `@/*` aponta para `src/*` (configurado em `vite.config.ts` e `tsconfig.app.json`).

## Rotas

Definidas em `src/routes/Routes.tsx` com `createBrowserRouter` (imports estáticos, sem lazy loading) e `basename: "/admin"`. Todas as rotas (exceto `/login`) são filhas de `App.tsx` (Header + `<Outlet />`) e exigem `RequireAuth`.

| Path (relativo a `/admin`) | Página (`src/pages/...`) | Guard de permissão |
|---|---|---|
| `/` | — | redireciona para `/home` |
| `/login` | `Login/index.tsx` | — |
| `/home` | `Home/index.tsx` | `RequireAuth` |
| `/events` | `Events/index.tsx` | `RequirePermission section="Eventos"` |
| `/events/:nameEvent/:datetime/qrcode-reader` | `Events/QRCodeReader/index.tsx` | `RequirePermission section="Eventos"` |
| `/semcomp-users` | `UserSemcomp/index.tsx` | `RequirePermission section="Usuários Semcomp"` |
| `/backoffice-users` | `UserBackoffice/index.tsx` | `RequirePermission section="Usuários Backoffice"` |
| `/participation` | `Participation/index.tsx` | `RequirePermission section="Participações"` |
| `/permissions` | `Permission/index.tsx` | `RequirePermission section="Permissões"` |
| `/pages-availability` | `PagesAvailability/index.tsx` | `RequirePermission section="Páginas"` |
| `*` | `NotFound/index.tsx` | `RequireAuth` |

Dois guards, aninhados (auth primeiro, depois permissão):

- **`RequireAuth`** (`src/lib/RequireAuth.tsx`) — exige `isAuthenticated` do `AuthContext`; se não autenticado, redireciona para `/login` guardando `location` em `state.from`.
- **`RequirePermission`** (`src/lib/RequirePermission.tsx`) — recebe uma prop `section` (deve bater com uma das seções em `constants/Tabs.tsx`, que por sua vez espelha `KnownSections` no backend, `backend/internal/permission/model.go`) e usa `useHasPermission(section, "R")`; sem permissão de leitura, redireciona para `/home`.

### Home (`/home`) — Navegação por Tabs
`pages/Home/index.tsx` lê `Tabs` (`constants/Tabs.tsx`) e filtra apenas as seções em que o admin logado tem alguma permissão (`permissions` do `AuthContext`), renderizando um card clicável por seção que navega para `tab.pageNavigate`.

### Padrão das páginas CRUD
`Events`, `UserSemcomp`, `UserBackoffice`, `Participation`, `Permission` seguem o mesmo padrão: fetch de dados via a API do domínio + `<CrudTable>` (`components/CrudTable.tsx`) configurada com os `fields` definidos em `src/data/<dominio>CrudField.ts`. Ver detalhes na seção "Como adicionar uma nova página" abaixo.

## Contexts

Providers globais montados em `App.tsx`:

```
App.tsx: NotificationProvider > AuthProvider > (Header + Outlet)
```

| Context | Arquivo | Hook de acesso | Responsabilidade |
|---|---|---|---|
| `AuthContext` | `contexts/AuthContext.tsx` | `useAuth()` | `user`, `isAuthenticated`, `permissions` (array de `BackofficePermission`), `login(email, senha)`, `logout()`, `refreshPermissions()`. Persiste `user` em `localStorage["semcomp-backoffice-auth"]`, permissões em `localStorage["semcomp-backoffice-permissions"]` e o JWT em `localStorage["semcomp-backoffice-token"]`. Ao restaurar uma sessão do localStorage, re-sincroniza permissões com o backend uma única vez via `GET /permissions/me`. Também exporta `useHasPermission(section, "R" \| "RW")`, usado tanto pelo `RequirePermission` quanto dentro das páginas para decidir se mostra botões de criar/editar/excluir (`canWrite`). |
| `NotificationContext` | `contexts/NotificationContext.tsx` | `useNotification()` | `showNotification(mensagem, tipo?, duracaoMs?)` / `hideNotification()`. Mesmo padrão do `front-site`. |

Não há `ThemeContext` no backoffice (sem dark mode) nem `FeatureFlagsContext`/`CartContext` — essas features são exclusivas do `front-site`.

## Componente central: `CrudTable`

`src/components/CrudTable.tsx` é o coração da maioria das páginas: tabela genérica com busca/filtro, ordenação por coluna, paginação, e modais de criar/editar/excluir — tudo dirigido por uma lista de `CrudField` (`{ value, label, type, selectVariants?, multiValueOptions? }`).

Duas formas de uso:
- **Client-side** (padrão): passe `data` já carregada; a própria tabela filtra/ordena/pagina.
- **Server-side** (`serverSide` prop, usado em `Events`): a tabela apenas dispara `onQueryChange({ page, pageSize, sortField, sortOrder, filterField, filterValue })` e o componente pai busca os dados filtrados na API, informando `totalRecords`.

A página fornece `onCreate` / `onEdit` / `onDelete` (chamam a API do domínio e atualizam o state local) e `canWrite` (de `useHasPermission(section, "RW")`) para esconder as ações de escrita quando o admin só tem permissão `"R"`.

## Como adicionar uma nova página

A maioria das páginas novas no backoffice são telas de CRUD ligadas a uma seção de permissão. Passo a passo:

1. **Backend**: confirme que a seção existe em `KnownSections` (`backend/internal/permission/model.go`) e que há endpoints REST para o recurso.
2. **API**: crie `src/api/meuRecurso.ts` (siga o padrão de `src/api/events.ts`) e exporte pelo barrel `src/api/index.ts`.
3. **Tipo**: defina o tipo do recurso em `src/types/`.
4. **Campos da tabela**: crie `src/data/meuRecursoCrudField.ts` exportando `fields: CrudField[]` — um item por coluna exibida/editável.
5. **Seção do menu**: adicione uma entrada em `src/constants/Tabs.tsx` (`key`, `section` — deve ser **idêntico** ao nome da seção no backend —, `label`, `description`, `pageNavigate`, `icon`).
6. **Página**: crie `src/pages/MeuRecurso/index.tsx` seguindo o padrão de `pages/Events/index.tsx`:
   - `useHasPermission("Minha Seção", "RW")` para `canWrite`;
   - funções `fetchMeuRecurso` / `handleCreate` / `handleEdit` / `handleDelete` chamando a API;
   - renderizar `<BannerCard>` + `<CrudTable data={...} fields={fields} onEdit={...} onDelete={...} onCreate={...} canWrite={canWrite} getItemKey={...} entityLabel="..." />`.
7. **Rota**: registre em `src/routes/Routes.tsx`, dentro de `RequireAuth`, envolvendo com `{ element: <RequirePermission section="Minha Seção" />, children: [{ path: "/meu-recurso", element: <MeuRecursoCRUD /> }] }`.
8. **Rode `yarn dev`**, garanta que a rota só aparece/funciona para um admin com permissão na seção (`R` mostra só leitura, `RW` mostra os botões de escrita, sem permissão redireciona para `/home`).

Para uma página que **não** é um CRUD (ex.: um dashboard), pule os passos 4 e 6-parcial e monte a UI livremente — os únicos passos obrigatórios continuam sendo o guard de permissão (se aplicável), a entrada em `Tabs.tsx` (se deve aparecer na Home) e o registro da rota.
