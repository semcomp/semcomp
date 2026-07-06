---
type: feature-flow
tags: [feature, auth, jwt, sessao, site, backoffice]
---
# Funcionalidade: Autenticação e Sessões

Dois fluxos JWT completamente isolados — tokens incompatíveis entre si.

---

## Fluxo Site

| Etapa | Detalhe |
|---|---|
| Endpoint | `POST /login` (público) |
| Service | `authService.Login` → `userRepository.GetByEmail` → `bcrypt.Compare` → `jwtProvider.Generate(userNumber, email)` |
| Claims geradas | `{ id: uint, sub: email, email, exp, iat }` |
| Struct claims | `AuthTokenClaims { UserNumber uint, Email string }` — `internal/providers/jwt_provider.go` |
| Resposta | `{ message, user: SafeUser, token: string }` |
| Front salva | `localStorage["semcomp-site-token"]` + `localStorage["semcomp-site-auth"]` (user JSON) |
| Context | [[Front_Hooks_e_Estados#AuthContext_Site]] → `navigate("/profile")` após login |
| Guard | `AuthMiddleware` injeta `userNumber(uint)` + `email(string)` no contexto Gin |

### Tratamento de Erros (site)
```
err.response.data.error
  → err.response.data.message
    → err.message
      → "Erro no login" (fallback)
```
Exibido via `showNotification(message, "warning")` — [[Front_Hooks_e_Estados#NotificationContext]]

---

## Fluxo Backoffice

| Etapa | Detalhe |
|---|---|
| Endpoint | `POST /admin/login` (público) |
| Service | `authBackofficeService.Login` → `userBackofficeRepository.GetByEmail` → `bcrypt.Compare` → `jwtProvider.GenerateToBackoffice(email)` |
| Claims geradas | `{ sub: email, email, exp, iat }` — sem `id`/`UserNumber` |
| Struct claims | `AuthBackofficeTokenClaims { Email string }` — `internal/providers/jwt_provider.go` |
| Resposta extra | `permissions: []Permission` buscado via `permissionService.GetPermissionByUser(email)` antes de responder |
| Resposta | `{ message, user: SafeUserB, permissions: []Permission, token: string }` |
| Front salva | `localStorage["semcomp-backoffice-token"]` + `localStorage["semcomp-backoffice-auth"]` |
| Context | [[Front_Hooks_e_Estados#AuthContext_Backoffice]] → `navigate("/home", { replace: true })` |
| Guard | `AuthBackofficeMiddleware` injeta apenas `email(string)` no contexto Gin |

### Tratamento de Erros (backoffice)
- Sem permissões → login é permitido, `message = "Login realizado, mas você não possui permissões"`
- 401 em qualquer rota → interceptador Axios limpa token + `window.location.href = "/admin/login"` (não passa pelo React Router)

### `isAuthenticated` (backoffice)
```ts
user !== null && !!localStorage.getItem("semcomp-backoffice-token")
```
Dupla verificação evita estado inconsistente entre user no state e token removido externamente.

---

## Structs de Claims (comparação)

| Campo | Site (`AuthTokenClaims`) | Backoffice (`AuthBackofficeTokenClaims`) |
|---|---|---|
| `UserNumber` | `uint` (payload `id`) | ausente |
| `Email` | `string` (payload `sub`) | `string` (payload `sub`) |

---

## Referências
- Structs: [[Backend_Models#JWT_Claims]]
- Providers: [[Backend_Arquitetura#providers]]
- Rotas: [[Integracao_API#POST_login]], [[Integracao_API#POST_admin_login]]
- Contextos: [[Front_Hooks_e_Estados#AuthContext_Site]], [[Front_Hooks_e_Estados#AuthContext_Backoffice]]
