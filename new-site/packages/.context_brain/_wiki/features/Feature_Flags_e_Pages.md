---
type: feature-flow
tags: [feature, flags, pages, toggle, disponibilidade, backoffice]
---
# Feature: Feature Flags e Disponibilidade de Páginas

Sistema de feature toggle para habilitar/desabilitar páginas do site público.

---

## Backend — Módulo Pages

Arquivo: `internal/pages/`  
Estado: **in-memory** (map `page → available bool`) — **reiniciar o servidor reseta tudo para `true`**.

Inicializado em `main.go`:
```go
pagesService := pages.NewService([]string{"home", "login", "cronograma", "profile", "riddle", "loja"})
```

### Endpoints

| Método | Path | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/pages/availability` | público | Retorna `{ pages: { home: bool, login: bool, ... } }` |
| `GET` | `/pages/:page/availability` | público | Status de uma página específica |
| `PUT` | `/admin/pages/:page/availability` | PermRW `"Páginas"` | Habilita/desabilita uma página |

### Middleware `RequirePageAvailable`
Arquivo: `internal/middleware/page.go`  
Retorna **503** se a página está desabilitada.  
Usado como `pageMW("login")`, `pageMW("cronograma")`, `pageMW("loja")`,
`pageMW("riddle")` (nas rotas do jogo `/api/riddles/*`), etc.

---

## Frontend — FeatureFlagsContext (site)

Arquivo: `src/contexts/FeatureFlagsContext.tsx`

- Faz `GET /pages/availability` no mount da aplicação
- Default flags (em caso de erro):
  ```ts
  { home: true, login: true, cronograma: true, profile: true, riddle: true, loja: true }
  ```
- `home` é **sempre `true`** — sobrescreve qualquer resposta da API
- `isFeatureEnabled(key)` retorna `true` se flag não encontrada (fail-open)
- Hook: `useFeatureFlags()`

### FeatureGuard
Arquivo: `src/components/FeatureGuard.tsx`  
Outlet wrapper do React Router:

```
isLoading → exibe "Carregando..."
isFeatureEnabled(key) = false → <Navigate to="/" replace />
isFeatureEnabled(key) = true → <Outlet />
```

Usado em `Routes.tsx` para envolver rotas controláveis:
- `/cronograma` → FeatureGuard(`"cronograma"`)
- `/login`, `/reset-password` → FeatureGuard(`"login"`)
- `/profile` → FeatureGuard(`"login"`)
- `/loja`, `/loja/carrinho`, `/loja/checkout` → FeatureGuard(`"loja"`)
- `/riddle` → FeatureGuard(`"riddle"`)

---

## Frontend — PagesAvailability (backoffice)

Página: `pages/PagesAvailability/index.tsx`  
Rota: `/pages-availability` | Seção: `"Páginas"` | Ícone: `ToggleLeft`

- Lista todas as páginas via `pagesAPI.getAll()`
- Toggle switch por linha (Switch shadcn/ui)
- Salva em tempo real: `PUT /admin/pages/:page/availability`
- **Optimistic update** — reverte se a chamada falhar
- `canWrite = useHasPermission("Páginas", "RW")` — Switch desabilitado para leitura

---

## Limitações

- Estado das flags vive **em memória no processo Go** — qualquer restart do servidor reseta todas para `available: true`
- Não há persistência em banco — se a intenção é que flags sobrevivam a restarts, precisaria de tabela no DB
- A flag `"home"` é ignorada pelo frontend (sempre `true`) mas o backend pode desabilitá-la via `pageMW`

---

## Referências
- Backend módulo: [[Backend_Arquitetura#pages]]
- Contexto do site: [[Site_Contextos#FeatureFlagsContext]]
- Rotas do site: [[Site_Paginas_e_Rotas]]
- Página backoffice: [[Backoffice_Paginas_e_Rotas#PagesAvailability]]
