---
type: wiki-frontend
tags: [frontend, site, pages, routes, react, vite]
---
# Front-Site — Páginas e Rotas

Pacote: `packages/front-site/src/`  
Porta dev: **5173** | Router: React Router v6 `createBrowserRouter` (lazy loading)

## Estrutura de Guards

```
App (layout)
├── FeatureGuard("cronograma")
│   └── /cronograma
├── FeatureGuard("login")
│   ├── /login
│   └── /reset-password
├── /verify-email             ← pública (sem guard)
├── RequireAuth
│   ├── FeatureGuard("login")
│   │   └── /profile
│   └── FeatureGuard("loja")
│       ├── /loja
│       ├── /loja/carrinho
│       └── /loja/checkout
├── /                         ← Home (sempre disponível)
└── *                         ← NotFound
```

## Tabela de Rotas

| Path | Componente | Guards | API |
|---|---|---|---|
| `/` | `pages/Home/index.tsx` | — | estático |
| `/cronograma` | `pages/Cronograma/index.tsx` | FeatureGuard(`cronograma`) | `GET /events?limit=1000` |
| `/login` | `pages/Login/index.tsx` | FeatureGuard(`login`) | `POST /login` |
| `/reset-password` | `pages/ResetPassword/index.tsx` | FeatureGuard(`login`) | `POST /reset-password` |
| `/verify-email` | `pages/VerifyEmail/index.tsx` | — | `GET /api/verify-email` (param: token) |
| `/profile` | `pages/Profile/index.tsx` | RequireAuth + FeatureGuard(`login`) | `GET /api/profile` |
| `/loja` | `pages/Store/StorePage.tsx` | RequireAuth + FeatureGuard(`loja`) | `GET /products?limit=1000` |
| `/loja/carrinho` | `pages/Store/Cart.tsx` | RequireAuth + FeatureGuard(`loja`) | `POST /api/payments/pix` |
| `/loja/checkout` | `pages/Store/Checkout.tsx` | RequireAuth + FeatureGuard(`loja`) | `GET /api/payments/:id/status` |
| `*` | `pages/NotFound/index.tsx` | — | — |

## Home (`/`) — Seções
Componentes renderizados em ordem:
1. `MainEntrance` — hero com arrow bounce
2. `SobreSection` — texto sobre a Semcomp
3. `PatrocinadoresSection` — logos (via `constants/Sponsors.ts`)
4. `EquipeSection` — membros da equipe
5. `FAQSection` — perguntas frequentes
6. `ContatoSection` — formulário de contato

Background alterna com `isDarkMode` via `ThemeContext`.

## Cronograma (`/cronograma`) — Lógica
1. Busca `eventsAPI.getAllEvents()` → `GET /events?limit=1000`
2. Ordena por `dateInit` crescente
3. Agrupamento por sobreposição: se `inicio < fimDoGrupoAtual` → mesmo grupo
4. Renderiza grupos em colunas (multi-coluna para sobreposições)
5. `eventsAPI` importado **diretamente** de `@/api/events`, não pelo barrel

## Profile (`/profile`) — Lógica
1. `authAPI.getProfile()` → `GET /api/profile`
2. Exibe QR Code com `user_number` via `react-qr-code`
3. Aba `"qr"` (default) + aba `"account"` (dados pessoais)
4. Imagem hero aleatória via `import.meta.glob("/src/assets/img/Home/Hero/*.webp")`
5. Reutiliza `<ContatoSection>` no rodapé

## RequireAuth
Arquivo: `src/lib/RequireAuth.tsx` — redireciona para `/login` se não autenticado.

## FeatureGuard
Arquivo: `src/components/FeatureGuard.tsx` — Outlet wrapper:
- Mostra loading enquanto busca flags
- Se feature disabled → `<Navigate to="/" replace />`
- → [[Feature_Flags_e_Pages]]
