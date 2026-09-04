---
type: wiki-frontend
tags: [frontend, site, pages, routes, react, vite]
---
# Front-Site — Páginas e Rotas

Pacote: `packages/front-site/src/`  
Porta dev: **5173** | Router: React Router v6 `createBrowserRouter`. O layout raiz (`App`) é estático (importado no entry via `Routes.tsx`); apenas as **páginas-filhas são lazy** via `lazy:`.

## Estrutura de Guards

```
App (layout raiz — estático, não-lazy)
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
2. `signinEventsAPI.getSigninEvents()` → `GET /api/signin-events` (eventos inscritiveis)
3. `signinEventsAPI.getMySignins()` → `GET /api/signin-events/me` (inscrições ativas)
4. Exibe QR Code com `user_number` via `react-qr-code`
5. Seção de inscrição em eventos: lista `EventType[]` com `has_signin=true`, botão "Inscrever-se" / "Desistir", status "Inscrito" / "Lista de Espera - Nª posição"
6. Background: `<AnimatedBackground />` (vídeo `.webm` em loop em `public/img/Profile/background.webm`)
7. Card SVG temático em `public/img/Profile/Card.svg`
8. Componente `EventCardMobile` (memo) para renderizar cada evento
9. Reutiliza `<ContatoSection>` no rodapé
- `signinEventsAPI` importado diretamente de `@/api/signinEvents` (não pelo barrel)
- → [[Feature_SigninEvent]]

## RequireAuth
Arquivo: `src/lib/RequireAuth.tsx` — redireciona para `/login` se não autenticado.

## FeatureGuard
Arquivo: `src/components/FeatureGuard.tsx` — Outlet wrapper:
- Mostra loading enquanto busca flags
- Se feature disabled → `<Navigate to="/" replace />`
- → [[Feature_Flags_e_Pages]]
