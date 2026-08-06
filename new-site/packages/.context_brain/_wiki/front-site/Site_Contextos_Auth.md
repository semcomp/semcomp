---
type: wiki-frontend
tags: [frontend, site, auth, context, axios, jwt, localstorage]
---
# Front-Site — AuthContext e API Client

→ Hierarquia de providers: [[_raw/Front_Providers_e_Contextos]]  
→ Endpoints consumidos: [[Integracao_API_Site]]

---

## AuthContext
Arquivo: `src/contexts/AuthContext.tsx`  
Hook: `useAuth()` de `src/contexts/useAuth.ts`

| Valor | Tipo | Descrição |
|---|---|---|
| `isAuthenticated` | `boolean` | `user !== null` |
| `user` | `SafeUser \| null` | campos completos (name, email, age, gender, city, etc.) |
| `token` | `string \| null` | JWT lido do localStorage |
| `login(email, pw)` | `Promise<void>` | `POST /login` → salva storage → navega `/profile` |
| `logout()` | `void` | remove storage + reseta state → navega `/login` |

**Storage keys:**
- `semcomp-site-token` — JWT string
- `semcomp-site-auth` — JSON do SafeUser

**Tratamento de erro no login** (em cascata):
```
err.response.data.error → err.response.data.message → err.message → "Erro no login"
```
Exibido via `showNotification(message, "warning")`.

**Token hook auxiliar:** `useToken()` de `src/contexts/useToken.ts` — lê/escreve `semcomp-site-token` no localStorage.

---

## API Client (Site)
Arquivo: `src/api/client.ts`

- `baseURL` = `BASEURL` de `constants/ApiURL.ts`
- Request interceptor: injeta `Authorization: Bearer <token>` do localStorage
- Response interceptor: armazena token renovado se `response.headers.authorization` presente

---

## API Barrel (Site)
Arquivo: `src/api/index.ts` — exporta: `authAPI`, `client`

APIs importadas diretamente pelas páginas (não pelo barrel):
- `eventsAPI` → `@/api/events`
- `productsAPI` → `@/api/products`
- `paymentAPI` → `@/api/payment`
- `pagesAPI` → `@/api/pages`
