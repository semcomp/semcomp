---
type: feature-flow
tags: [feature, email, token, verification, reset-password, smtp]
---
# Feature: Email e Tokens

Dois sub-fluxos: verificação de email no cadastro e recuperação de senha.

---

## Módulo Token (backend)
Arquivo: `internal/token/model.go`  
Tabela: `tokens`

Tipos de token:
- `email_verification` — gerado no `POST /register` e no `POST /resend-verification`
- `password_reset` — gerado no `POST /forgot-password`

O backend armazena apenas o **hash SHA-256** do token, nunca o valor em texto puro.  
O token real vai para o email do usuário como query param na URL.

### Estados do Token
| Campo | Semântica |
|---|---|
| `ExpiresAt` | Token é inválido após esta data |
| `UsedAt` | Não-nulo = token já consumido |

---

## Mailer
Arquivo: `internal/mailer/mailer.go`

Config via env vars:

| Env | Descrição |
|---|---|
| `SMTP_HOST` | Host do servidor SMTP |
| `SMTP_PORT` | Porta (default: 587) |
| `SMTP_USER` | Usuário SMTP |
| `SMTP_PASSWORD` | Senha SMTP |
| `FRONTEND_URL` | Base URL do frontend (usado nos links dos emails) |

---

## Fluxo — Verificação de Email

```
POST /register
  └─ cria User (email_verified=false)
  └─ tokenProvider.Generate() → TokenHash salvo em tokens
  └─ mailer.SendVerification(email, tokenURL)
      └─ link: {FRONTEND_URL}/verify-email?token=<raw_token>

Usuário clica no link
  └─ frontend: pages/VerifyEmail/index.tsx (rota pública /verify-email)
  └─ GET /api/verify-email?token=<raw_token>   ← protegido por AuthMiddleware
  └─ userService.VerifyEmail(token) → hash, busca no DB, valida expiração/uso
  └─ marca email_verified=true + UsedAt=now

POST /resend-verification
  └─ gera novo token e reenvía email
```

> **Atenção**: `GET /api/verify-email` está no grupo `/api` protegido por `AuthMiddleware` — o usuário precisa estar logado para verificar o email. Isso significa que a verificação de email requer login prévio (mesmo que o email não esteja verificado).

---

## Fluxo — Reset de Senha

```
POST /forgot-password
  └─ busca User por email
  └─ tokenProvider.Generate() → salvo como password_reset
  └─ mailer.SendPasswordReset(email, resetURL)
      └─ link: {FRONTEND_URL}/reset-password?token=<raw_token>

Usuário clica no link
  └─ frontend: pages/ResetPassword/index.tsx
     (rota /reset-password, guard FeatureGuard("login"))
  └─ usuário digita nova senha
  └─ POST /reset-password { token, new_password }
  └─ valida token → bcrypt.Hash(newPassword) → atualiza user
```

---

## Endpoints

| Método | Path | Guard | Descrição |
|---|---|---|---|
| `POST` | `/register` | `pageMW("login")` | Cadastro + envia email de verificação |
| `POST` | `/verify-email` | `pageMW("login")` | Verifica token (via body — usado no mobile?) |
| `GET` | `/api/verify-email` | `AuthMiddleware` | Verifica token via query param |
| `POST` | `/resend-verification` | `pageMW("login")` | Reenvia email de verificação |
| `POST` | `/forgot-password` | `pageMW("login")` | Envia email de reset |
| `POST` | `/reset-password` | `pageMW("login")` | Redefine senha com token |

---

## Referências
- Modelo Token: [[Backend_Models#Token]]
- Provider de token: [[Backend_Providers#TokenProvider]]
- Rota `/verify-email` (frontend): [[Site_Paginas_e_Rotas]]
- Contexto de autenticação: [[Feature_Autenticacao_e_Sessoes]]
