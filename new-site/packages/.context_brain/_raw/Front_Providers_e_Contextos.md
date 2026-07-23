---
type: raw-frontend
tags: [frontend, providers, context, react, state, hierarchy]
---
# Front — Providers e Interfaces de Contextos

→ Wiki de contextos site: [[Site_Contextos_Auth]] e [[Site_Contextos_UI]]  
→ Wiki de contextos backoffice: [[Backoffice_Contextos_e_Lib]]

---

## Hierarquia de Providers

### front-site (`main.tsx` + `App.tsx`)
```
StrictMode
  Suspense (fallback: RouteLoading)
    FeatureFlagsProvider          ← busca GET /pages/availability no mount
      RouterProvider
        App (layout do router)
          NotificationProvider
            ThemeProvider
              AuthProvider
                CartProvider
                  Header
                  <Outlet />     ← páginas
                  DarkModeToggle
```

### front-backoffice (`main.tsx` + `App.tsx`)
```
StrictMode
  RouterProvider
    App (layout do router)
      NotificationProvider
        AuthProvider
          Header
          <Outlet />             ← páginas
```

> Backoffice **não tem** ThemeProvider nem CartProvider.  
> FeatureFlagsProvider está fora do router no site — flags disponíveis antes da primeira rota renderizar.

---

## AuthContext — Site
Arquivo: `front-site/src/contexts/AuthContext.tsx`  
Hook: `useAuth()` via `contexts/useAuth.ts`

| Valor | Tipo | Descrição |
|---|---|---|
| `isAuthenticated` | `boolean` | `user !== null` |
| `user` | `SafeUser \| null` | campos completos (name, email, age, gender...) |
| `token` | `string \| null` | JWT do localStorage |
| `login(email, pw)` | `Promise<void>` | `POST /login` → salva em localStorage → navega `/profile` |
| `logout()` | `void` | limpa storage + state → navega `/` ou `/login` |

Storage: `semcomp-site-token` (JWT) + `semcomp-site-auth` (SafeUser JSON)

Tratamento de erro no `login`:
```
err.response.data.error → err.response.data.message → err.message → "Erro no login"
```

---

## AuthContext — Backoffice
Arquivo: `front-backoffice/src/contexts/AuthContext.tsx`  
Hooks exportados do mesmo arquivo: `useAuth()`, `useHasPermission(section, level)`

| Valor | Tipo | Descrição |
|---|---|---|
| `isAuthenticated` | `boolean` | `user !== null && !!localStorage["semcomp-backoffice-token"]` |
| `user` | `{ email, name } \| null` | `name = email.split("@")[0]` (não vem do backend) |
| `permissions` | `BackofficePermission[]` | carregado no login e persistido |
| `login(email, pw)` | `Promise<void>` | `POST /admin/login` → salva tudo → navega `/home` |
| `logout()` | `void` | remove 3 chaves do localStorage → navega `/login` |
| `refreshPermissions()` | `Promise<void>` | `GET /admin/permissions/me` → atualiza state |

Storage: `semcomp-backoffice-token` + `semcomp-backoffice-auth` + `semcomp-backoffice-permissions`

```ts
// Dupla verificação evita estado inconsistente
isAuthenticated = user !== null && !!localStorage.getItem("semcomp-backoffice-token")
```

### useHasPermission
```ts
useHasPermission(section: string, level: "R" | "RW"): boolean
// "R"  → satisfeito por "R" OU "RW"
// "RW" → satisfeito apenas por "RW"
// ausência de entrada → false
```

---

## FeatureFlagsContext
Arquivo: `front-site/src/contexts/FeatureFlagsContext.tsx`  
Hook: `useFeatureFlags()`

```ts
type FeatureKey = "home" | "login" | "cronograma" | "profile" | "riddle" | "loja"

interface FeatureFlagsContextType {
    features: Record<FeatureKey, boolean>
    isLoading: boolean
    isFeatureEnabled: (key: FeatureKey) => boolean
}
```

- Default flags: todas `true` (usadas durante loading e em caso de erro)
- `home` é **sempre forçado para `true`** — não pode ser desabilitado via API
- `isFeatureEnabled` retorna `true` para chaves não encontradas (fail-open)

---

## CartContext
Arquivo: `front-site/src/contexts/CartContext.tsx`  
Hook: `useCart()`  
**Estado in-memory — perdido ao recarregar.**

```ts
interface CartItem {
    id: string
    cartKey: string    // "${id}_${size}_${dateTime}_${isBabydoll}"
    name: string
    price: number
    image: string
    quantity: number
    size?: string
    dateTime?: string
    isBabydoll?: boolean
}

interface CartContextType {
    items: CartItem[]
    addItem(params: AddToCartParams): void   // agrupa por cartKey
    removeItem(cartKey: string): void
    updateQuantity(cartKey: string, delta: number): void  // remove se qty → 0
    clearCart(): void                        // chamado após pagamento aprovado
    subtotal: number                         // Σ price * quantity
    totalItems: number                       // Σ quantity
}
```

---

## ThemeContext
Arquivo: `front-site/src/contexts/ThemeContext.tsx`  
Hook: `useTheme()` via `contexts/useTheme.tsx`  
**Exclusivo do front-site.**

```ts
interface ThemeContextType {
    isDarkMode: boolean      // default: true
    toggleDarkMode(): void   // persiste em localStorage["semcomp-theme"]
}
```

---

## NotificationContext
Arquivos: `front-site/src/contexts/NotificationContext.tsx` | `front-backoffice/src/contexts/NotificationContext.tsx`  
Hook: `useNotification()`

```ts
showNotification(message: string, type?: "success" | "warning", duration?: number): void
hideNotification(): void
```

- Renderiza `<Notification>` dentro do Provider (não em portal)
- `hideNotification` usa `setTimeout(..., 300)` para aguardar animação de saída

---

## Hooks Utilitários

| Hook | Arquivo | Descrição |
|---|---|---|
| `useToken()` | `front-site/src/contexts/useToken.ts` | lê/escreve `semcomp-site-token` no localStorage |
| `useWindowDimensions()` | `front-site/src/hooks/useWindowDimensions.ts` | retorna `{ width, height }` via `resize` event |
