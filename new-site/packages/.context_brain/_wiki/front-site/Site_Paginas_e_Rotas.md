---
type: wiki-frontend
tags: [frontend, site, pages, routes, react, vite]
---
# Front-Site — Páginas e Rotas

Pacote: `packages/front-site/src/`  
Porta dev: **5173** | Router: React Router v6 `createBrowserRouter`. O layout raiz (`App`) é **estático** (`Component: AppLayout` direto em `Routes.tsx`); todas as páginas-filhas são lazy via `lazy:`.

**Fontes**: Poppins (400/700/800) e Comfortaa (400/500/600/700) servidas como woff2 com unicode-range via `@fontsource/poppins` e `@fontsource/comfortaa` (importados em `src/index.css`). Arquivos TTF locais foram removidos.

**Build** (`vite.config.ts`): manualChunks define `vendor-react`, `vendor-router`, `vendor-gsap`, `vendor-framer` (framer-motion), `vendor-ui` (lucide, embla, clsx), `vendor-misc`.

**Servidor** (`nginx.conf`): gzip nível 6 para assets de texto/SVG; `Cache-Control: public, max-age=31536000, immutable` para `/assets/`; `no-cache` para `index.html`.

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
Componentes renderizados em ordem (todos `lazy()` exceto `MainEntrance`):

| Seção | Lazy | Descrição |
|---|---|---|
| `MainEntrance` | ❌ estático | hero com countdown + imagem aleatória responsiva |
| `SobreSection` | ✅ | texto + Carousel com `<picture>` (desktop `/public/` + mobile bundled) |
| `PatrocinadoresSection` | ✅ | logos (fetch API sponsors) |
| `EquipeSection` | ✅ | membros da equipe com fotos responsivas (`<picture>`) |
| `BarraEventsSection` | ✅ | barra de eventos |
| `NumerosSection` | ✅ | números da edição |
| `PatrocinadoresAntigosSection` | ✅ | patrocinadores históricos |
| `TornarPatrocinadorSection` | ✅ | CTA patrocinador |
| `FAQSection` | ✅ | perguntas frequentes |
| `ContatoSection` | ✅ | formulário de contato |

**Imagens responsivas**: `MainEntrance`, `Carousel` (via `SobreSection`) e `TeamGrid` usam `<picture><source media="(max-width: 768px)" srcSet={mobile}><img src={desktop}></picture>`. Versões mobile bundled em `src/assets/img/` (woff2); versões desktop servidas de `/public/`.

Background da Home alterna com `isDarkMode` via `ThemeContext`.

## Cronograma (`/cronograma`) — Lógica
1. Busca `eventsAPI.getAllEvents()` → `GET /events?limit=1000`
2. Ordena por `dateInit` crescente
3. Agrupamento por sobreposição: se `inicio < fimDoGrupoAtual` → mesmo grupo
4. Renderiza grupos em até 3 colunas (eventos mais longos nas colunas mais à direita)
5. `eventsAPI` importado **diretamente** de `@/api/events`, não pelo barrel
6. **Dois modos de visualização** (`"day"` / `"week"`) trocados por botão no cabeçalho
7. Modo `"day"`: filtra eventos do dia selecionado; navegação por `DayPill` + setas prev/next
8. Modo `"week"`: todos os dias em scroll horizontal com `maxColumns=2`
9. Clique em card abre `EventModal` com detalhes completos
10. Botão "Baixar cronograma" gera PNG via `html-to-image` (div oculta, 2200px)
→ Componentes: `EventButton`, `EventModal`, `DayPill`, `EventGroups` — ver [[Feature_Cronograma_e_Eventos]]

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
