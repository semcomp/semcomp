---
type: feature-flow
tags: [feature, auth, jwt, login, sessao]
---
# Feature: Autenticação e Sessões

Dois fluxos JWT completamente isolados — tokens incompatíveis entre si.

## Fluxo Site

| Etapa | Detalhe |
|---|---|
| Endpoint | `POST /login` (público) |
| Guard de página | `pageMW("login")` — retorna 503 se login desabilitado |
| Service | `userService.Login` → `GetByEmail` → `bcrypt.Compare` → `jwtProvider.Generate(userNumber, email)` |
| Claims | `{ id: uint, sub: email, email, exp, iat }` |
| Resposta | `{ message, user: SafeUser, token }` |
| Front salva | `localStorage["semcomp-site-token"]` + `localStorage["semcomp-site-auth"]` |
| Redirect | `navigate("/profile")` |
| Guard runtime | `AuthMiddleware` injeta `userNumber(uint)` + `email(string)` no contexto Gin |

---

## Fluxo Backoffice

| Etapa | Detalhe |
|---|---|
| Endpoint | `POST /admin/login` (público, sem `pageMW`) |
| Service | `authBackofficeService.Login` → `GetByEmail` → `bcrypt.Compare` → `jwtProvider.GenerateToBackoffice(email)` |
| Claims | `{ sub: email, email, exp, iat }` — **sem `id`/`UserNumber`** |
| Permissões | Buscadas via `permissionService.GetPermissionByUser(email)` antes de responder |
| Resposta | `{ message, user: SafeUserB, permissions: []Permission, token }` |
| Sem permissões | `message = "Login realizado, mas você não possui permissões"` |
| Front salva | `localStorage["semcomp-backoffice-token"]` + `auth` + `permissions` |
| Redirect | `navigate("/home", { replace: true })` |
| Guard runtime | `AuthBackofficeMiddleware` injeta apenas `email(string)` |
| 401 global | Interceptor Axios: limpa token + `window.location.href = "/admin/login"` |

---

## Comparação de Claims

| Campo | Site (`AuthTokenClaims`) | Backoffice (`AuthBackofficeTokenClaims`) |
|---|---|---|
| `UserNumber` | `uint` | ausente |
| `Email` | `string` | `string` |

---

## Registro (site)

`POST /register` → cria usuário com `email_verified = false` → envia email de verificação  
→ Fluxo completo de verificação em [[Feature_Email_e_Tokens]]

---

## Referências
- Providers: [[Backend_Providers]]
- Modelos: [[Backend_Modelos_Core]]
- Contextos: [[Site_Contextos_Auth]], [[Backoffice_Contextos_e_Lib]]
- Endpoints site: [[Integracao_API_Site]] | Endpoints backoffice: [[Integracao_API_Backoffice]]
