---
type: raw-frontend
tags: [frontend, hooks, context, react, state]
---
# Front — Hooks e Estados Globais

---

## AuthContext_Site
Arquivo: `front-site/src/contexts/AuthContext.tsx`  
Provider: `AuthProvider` | Hook: `useAuth` via `contexts/useAuth.ts`  
Storage: `semcomp-site-auth` (user JSON) + `semcomp-site-token` (JWT)

| Valor | Tipo | Descrição |
|---|---|---|
| `isAuthenticated` | `boolean` | `user !== null` |
| `user` | `UserType \| null` | `{ user_number, name, email }` |
| `login(email, pw)` | `Promise<boolean>` | `POST /login` → salva token → `showNotification` → `/profile` |
| `logout()` | `void` | limpa user + token → `showNotification` → `/` |

- `login` usa `useNotification` internamente para feedback de sucesso/erro
- Erros exibidos: `err.response.data.error` → `err.response.data.message` → `err.message` → fallback
- Dependências: [[Integracao_API#POST_login]], [[Front_Hooks_e_Estados#NotificationContext]]

---

## AuthContext_Backoffice
Arquivo: `front-backoffice/src/contexts/AuthContext.tsx`  
Provider: `AuthProvider` | Hook: `useAuth` (exportado do mesmo arquivo — não é arquivo separado)  
Storage: `semcomp-backoffice-auth` (user JSON) + `semcomp-backoffice-token` (JWT)

| Valor | Tipo | Descrição |
|---|---|---|
| `isAuthenticated` | `boolean` | `user !== null && !!localStorage["semcomp-backoffice-token"]` |
| `user` | `{ email, name } \| null` | `name = email.split("@")[0]` (não vem do backend) |
| `login(email, pw)` | `Promise<boolean>` | `POST /admin/login` → salva token → `navigate("/home", { replace: true })` |
| `logout()` | `void` | limpa user + token → `navigate("/login", { replace: true })` |

- `isAuthenticated` checa **tanto** user **quanto** token (evita estado inconsistente)
- Erro de 401 tratado no cliente Axios (não no context) — ver [[Backoffice_Contextos_e_Lib#API_Client]]
- Dependências: [[Integracao_API#POST_admin_login]]

---

## ThemeContext
Arquivo: `front-site/src/contexts/ThemeContext.tsx`  
Provider: `ThemeProvider` | Hook: `useTheme` via `contexts/useTheme.tsx`  
Storage: `semcomp-theme` (`"dark"` | `"light"`) | Default: `"dark"`

| Valor | Tipo | Descrição |
|---|---|---|
| `isDarkMode` | `boolean` | `true` = dark (default) |
| `toggleTheme()` | `void` | alterna e persiste no localStorage |

Classes aplicadas no wrapper `ThemeProvider`:
- dark: `bg-semcompDarkBlue text-semcompLightBlue`
- light: `bg-semcompMidLightBlue text-semcompDarkBlue`

**Exclusivo do `front-site`** — backoffice não tem ThemeContext.  
Usado por: `pages/Home/index.tsx`, `pages/Cronograma/index.tsx`, `pages/Profile/index.tsx`

---

## NotificationContext
Arquivo (site): `front-site/src/contexts/NotificationContext.tsx`  
Arquivo (backoffice): `front-backoffice/src/contexts/NotificationContext.tsx`  
Hook: `useNotification()` (exportado do arquivo)

| Valor | Tipo | Descrição |
|---|---|---|
| `showNotification(msg, type?, duration?)` | `void` | exibe toast (default: `"info"`, 2500ms) |
| `hideNotification()` | `void` | fecha toast imediatamente |

- Renderiza `<Notification>` **fora** do `NotificationContext.Provider` (direto no JSX do Provider)
- `hideNotification` usa `setTimeout(setMessage(""), 300)` para aguardar animação de saída
- Usado por [[Front_Hooks_e_Estados#AuthContext_Site]] em `login` e `logout`
- Tipos de notificação: definidos em `src/types/NotificationType.ts`

---

## useToken
Arquivo: `front-site/src/contexts/useToken.ts`  
Hook utilitário — lê/escreve o JWT do site em `localStorage["semcomp-site-token"]`.

---

## useWindowDimensions
Arquivo: `front-site/src/hooks/useWindowDimensions.ts`  
Retorna `{ width, height }` via `window.innerWidth/innerHeight`.  
Usado em: `pages/Profile/index.tsx` (layout responsivo com QR Code).

---

## Hierarquia de Providers (front-site)
```
NotificationProvider
  └─ ThemeProvider
       └─ AuthProvider  (injeta useNotification para feedback de login)
            └─ Router
                 └─ <App />
```

## Hierarquia de Providers (front-backoffice)
```
AuthProvider
  └─ Router
       └─ <App />
```
*NotificationContext disponível mas hierarquia pode variar — verificar `src/main.tsx`*

---

## TypeScript Types (front-backoffice relevantes)

| Arquivo | Tipo | Campos |
|---|---|---|
| `types/EventType.ts` | `EventType` | `id, nameEvent, dateInit, dateEnd, local, type, description, hasPresence` |
| `types/ParticipationType.ts` | `ParticipationType` | `user_number, name_event, date_event, user_backoffice` |
| `types/SectionType.ts` | `SectionType` | `id, name, description` |
| `types/SemcompUserType.ts` | `SemcompUserType` | `id, user_number, name, email, presence_rate, password` |
| `types/BackofficeUserType.ts` | `BackofficeUserType` | `id, email, password` |
| `types/BackofficePermissionType.ts` | `BackofficePermissionType` | `email, section, type[]` |
| `types/CrudItem.ts` | `CrudItemType` | base interface com `id` |

→ Ver páginas que consomem esses contextos em [[Front_Paginas_e_Rotas]]
