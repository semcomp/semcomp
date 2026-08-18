---
type: wiki-frontend
tags: [frontend, site, context, theme, notification, feature-flags, cart]
---
# Front-Site — Contextos de UI e Feature Flags

→ Hierarquia de providers: [[_raw/Front_Providers_e_Contextos]]  
→ Fluxo de feature flags: [[Feature_Flags_e_Pages]]  
→ Fluxo da loja: [[Feature_Loja_e_Pagamentos]]

---

## ThemeContext
Arquivo: `src/contexts/ThemeContext.tsx`  
Hook: `useTheme()` de `src/contexts/useTheme.tsx`  
**Exclusivo do front-site** (backoffice não tem tema).

| Valor | Tipo | Notas |
|---|---|---|
| `isDarkMode` | `boolean` | default: `true` |
| `toggleDarkMode()` | `void` | persiste em `localStorage["semcomp-theme"]` |

---

## NotificationContext
Arquivo: `src/contexts/NotificationContext.tsx` (replicado em `front-backoffice`)  
Hook: `useNotification()`

```ts
showNotification(message: string, type?: "success" | "warning", duration?: number): void
hideNotification(): void
```

- Renderiza `<Notification>` dentro do próprio Provider (não usa portal)
- `hideNotification` usa `setTimeout(..., 300)` para aguardar animação de saída

---

## FeatureFlagsContext
Arquivo: `src/contexts/FeatureFlagsContext.tsx`  
Hook: `useFeatureFlags()`  
**Montado fora do router** — flags disponíveis antes da primeira rota renderizar.

```ts
type FeatureKey = "home" | "login" | "cronograma" | "profile" | "riddle" | "loja"
```

| Valor | Tipo | Comportamento |
|---|---|---|
| `features` | `Record<FeatureKey, boolean>` | carregado de `GET /pages/availability` |
| `isLoading` | `boolean` | `true` durante o fetch inicial |
| `isFeatureEnabled(key)` | `boolean` | falha-aberta: retorna `true` para chaves desconhecidas |

- Default flags: todas `true` (usado durante loading e em caso de erro de fetch)
- `home` é **sempre forçado para `true`** — não pode ser desabilitado pela API
- `isLoading=true` → `FeatureGuard` exibe tela de carregamento

---

## CartContext
Arquivo: `src/contexts/CartContext.tsx`  
Hook: `useCart()`  
**Estado in-memory — perdido ao recarregar a página.**

| Export | Tipo | Descrição |
|---|---|---|
| `items` | `CartItem[]` | itens no carrinho |
| `addItem(params)` | — | agrupa por `cartKey = "${id}_${size}_${dateTime}_${isBabylook}"` |
| `removeItem(cartKey)` | — | remove pelo cartKey |
| `updateQuantity(cartKey, delta)` | — | remove automaticamente se quantidade cai para 0 |
| `clearCart()` | — | esvazia (chamado após pagamento aprovado) |
| `subtotal` | `number` | soma de `price * quantity` |
| `totalItems` | `number` | soma de `quantity` |

**Quantidade máxima**: `COFFEE` e `COMBO` têm `maxQuantity = 1` (compra única
por usuário); `KIT` não tem teto (`Infinity`).

### CartItem
```ts
{
  id: string
  cartKey: string        // "${id}_${size}_${dateTime}_${isBabylook}"
  name: string
  price: number
  image: string
  quantity: number
  size?: string          // KIT e COMBO
  dateTime?: string      // COFFEE e COMBO (ISO string)
  isBabylook?: boolean   // KIT babylook
}
```
