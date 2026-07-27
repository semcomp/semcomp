# front-site

Site público da Semcomp (participantes). React 19 + TypeScript + Vite + Tailwind, rodando em `http://localhost:5173`.

Este README documenta a estrutura de `src/`, as rotas, os contexts/hooks principais e o passo a passo para adicionar uma nova página. Para a arquitetura do monorepo como um todo, veja `../.context_brain/_wiki/`.

## Rodando localmente

```bash
yarn install
yarn dev
```

A URL da API é resolvida em `src/constants/ApiURL.tsx` via a env var `VITE_DEBUG_MODE`:

- `VITE_DEBUG_MODE=true` → `http://localhost:4000` (backend local)
- qualquer outro valor (ou ausente) → `https://semcomp.icmc.usp.br/api` (produção)

## Estrutura de `src/`

```
src/
├── api/            # client axios + funções de chamada por domínio (auth, events, pages, payment, products, sponsors)
├── assets/         # fontes, imagens (webp/avif com fallback)
├── components/     # componentes compartilhados entre páginas (Header, Notification, FeatureGuard...) e components/ui (primitivos estilo shadcn)
├── constants/      # ApiURL, Sponsors
├── contexts/       # Auth, Theme, Cart, Notification, FeatureFlags (+ hooks useX correspondentes)
├── hooks/          # hooks utilitários genéricos (useWindowDimensions)
├── lib/            # RequireAuth, gsap setup, constantes de domínio (Team, FAQS, EventTypes), utils
├── mock/           # dados mockados usados em dev (mockEvents, terms)
├── pages/          # uma pasta por página, cada uma com index.tsx (ver seção Rotas)
├── routes/         # Routes.tsx — definição do createBrowserRouter
├── types/          # tipos TS compartilhados (UserType, EventType, ProductType...)
├── utils/          # funções utilitárias soltas (validateEmail)
├── App.tsx         # layout raiz: Header + <Outlet /> + DarkModeToggle, dentro dos Providers
└── main.tsx        # bootstrap: StrictMode > Suspense > FeatureFlagsProvider > RouterProvider
```

Alias de import: `@/*` aponta para `src/*` (configurado em `vite.config.ts` e `tsconfig.app.json`). Sempre importe com `@/...` em vez de caminhos relativos longos.

## Rotas

Definidas em `src/routes/Routes.tsx` com `createBrowserRouter` e lazy loading (`lazy: async () => import(...)`) — cada página só baixa seu bundle quando a rota é acessada. Todas as rotas são filhas de `AppLayout` (`App.tsx`), que renderiza `Header` + `<Outlet />` + `DarkModeToggle` por fora do conteúdo da página.

| Path | Página (`src/pages/...`) | Guards |
|---|---|---|
| `/` | `Home/index.tsx` | — |
| `/cronograma` | `Cronograma/index.tsx` | `FeatureGuard featureKey="cronograma"` |
| `/login` | `Login/index.tsx` | `FeatureGuard featureKey="login"` |
| `/reset-password` | `ResetPassword/index.tsx` | `FeatureGuard featureKey="login"` |
| `/verify-email` | `VerifyEmail/index.tsx` | — |
| `/profile` | `Profile/index.tsx` | `RequireAuth` + `FeatureGuard featureKey="login"` |
| `/loja` | `Store/StorePage.tsx` | `RequireAuth` + `FeatureGuard featureKey="loja"` |
| `/loja/carrinho` | `Store/Cart.tsx` | `RequireAuth` + `FeatureGuard featureKey="loja"` |
| `/loja/checkout` | `Store/Checkout.tsx` | `RequireAuth` + `FeatureGuard featureKey="loja"` |
| `*` | `NotFound/index.tsx` | — |

Dois guards diferentes, que podem ser combinados (aninhando um `element` dentro do outro):

- **`RequireAuth`** (`src/lib/RequireAuth.tsx`) — exige `isAuthenticated` do `AuthContext`; se não autenticado, redireciona para `/` guardando `location` em `state.from`.
- **`FeatureGuard`** (`src/components/FeatureGuard.tsx`) — exige que a feature esteja habilitada no `FeatureFlagsContext` (flags vindas do backend via `pagesAPI.getAllAvailability`); se desabilitada, redireciona para `/`. Enquanto as flags carregam, mostra "Carregando...".

A Home (`pages/Home/index.tsx`) é composta por seções lazy-loaded em `pages/Home/sections/*` (Sobre, Patrocinadores, Equipe, FAQ, Números, Patrocinadores Antigos, Tornar-se Patrocinador, Contato) renderizadas em sequência com `<Suspense>`.

## Contexts

Todos os providers globais ficam em `App.tsx` (exceto `FeatureFlagsProvider`, que fica em `main.tsx` — precisa estar disponível antes do router, já que `FeatureGuard` roda durante a navegação):

```
main.tsx:  FeatureFlagsProvider > RouterProvider
App.tsx:   NotificationProvider > ThemeProvider > AuthProvider > CartProvider
```

| Context | Arquivo | Hook de acesso | Responsabilidade |
|---|---|---|---|
| `AuthContext` | `contexts/AuthContext.tsx` | `useAuth()` (`contexts/useAuth.ts`) | `user`, `isAuthenticated`, `login(email, senha)`, `logout()`. Persiste `user` em `localStorage["semcomp-site-auth"]` e o JWT em `localStorage["semcomp-site-token"]`. |
| `ThemeContext` | `contexts/ThemeContext.tsx` | `useTheme()` (`contexts/useTheme.tsx`) | `isDarkMode`, `toggleTheme()`. Default segue `prefers-color-scheme` do SO na 1ª visita; depois persiste em `localStorage["semcomp-theme"]`. Aplica/remove classe `.dark` no `<html>` (liga as variantes `dark:` do Tailwind). |
| `NotificationContext` | `contexts/NotificationContext.tsx` | `useNotification()` | `showNotification(mensagem, tipo?, duracaoMs?)` / `hideNotification()`. Renderiza um único `<Notification>` global (toast). |
| `CartContext` | `contexts/CartContext.tsx` | `useCart()` | Carrinho da loja: `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `subtotal`, `totalItems`. Estado só em memória (não persiste em localStorage). |
| `FeatureFlagsContext` | `contexts/FeatureFlagsContext.tsx` | `useFeatureFlags()` | `isFeatureEnabled(key)` para as chaves de `FeatureKeyType.ts` (`home`, `login`, `cronograma`, `profile`, `riddle`, `loja`). Busca flags do backend uma vez no mount; usa `defaultFlags` (tudo `true`) como fallback/loading. `home` é sempre forçado `true`. |

`useToken()` (`contexts/useToken.ts`) não é um context — é um hook simples que lê `localStorage["semcomp-site-token"]` diretamente.

## Hooks

- `useAuth`, `useTheme`, `useCart`, `useNotification`, `useFeatureFlags`, `useToken` — descritos acima.
- `useWindowDimensions` (`hooks/useWindowDimensions.ts`) — retorna `{ width, height }` da janela, atualizado em `resize`. Genérico, não ligado a nenhum context.

## Como adicionar uma nova página

1. **Crie a pasta da página** em `src/pages/NomeDaPagina/index.tsx` (siga o padrão das páginas existentes: `export default function NomeDaPaginaPage() { ... }`). Se a página precisa de subseções, crie uma subpasta `sections/` como em `pages/Home/`.
2. **(Opcional) Adicione a feature key** em `src/types/FeatureKeyType.ts` se a página deve poder ser ligada/desligada remotamente pelo backend (via `pagesAPI.getAllAvailability`), e inclua o default em `defaultFlags` no `FeatureFlagsContext.tsx`.
3. **Registre a rota** em `src/routes/Routes.tsx`, dentro do array `children` de `AppLayout`, seguindo o padrão de lazy import:
   ```tsx
   {
     path: "minha-pagina",
     lazy: async () => {
       const { default: MinhaPaginaPage } = await import("@/pages/MinhaPagina");
       return { Component: MinhaPaginaPage };
     },
   },
   ```
   - Se a página exige login, envolva com `{ element: <RequireAuth />, children: [...] }` (ou aninhe dentro do bloco `RequireAuth` já existente).
   - Se usa feature flag, envolva com `{ element: <FeatureGuard featureKey="minha-pagina" />, children: [...] }`.
4. **Chamadas à API**: crie/edite um arquivo em `src/api/` (um por domínio) e exporte-o pelo barrel `src/api/index.ts` se for consumido fora daquele domínio.
5. **Tipos**: defina/reaproveite tipos em `src/types/`.
6. **Rode `yarn dev`** e confira em `http://localhost:5173/minha-pagina`, testando os dois temas (claro/escuro) e, se aplicável, os estados logado/deslogado.

Não é necessário adicionar a página em nenhum "menu central" — a navegação (`Header.tsx`) é atualizada separadamente caso a página deva aparecer no menu.
