---
type: wiki-providers
tags: [backend, providers, jwt, bcrypt, email, token]
---
# Backend — Providers

Arquivo: `internal/providers/`

## JWTProvider
Arquivo: `providers/jwt_provider.go`

Interface com 4 métodos:

| Método | Uso | Claims |
|---|---|---|
| `Generate(userNumber, email)` | Login do site | `{ id: uint, sub: email, email, exp, iat }` |
| `Parse(token)` | `AuthMiddleware` | Retorna `AuthTokenClaims` |
| `GenerateToBackoffice(email)` | Login do backoffice | `{ sub: email, email, exp, iat }` — sem `id` |
| `ParseToBackoffice(token)` | `AuthBackofficeMiddleware` | Retorna `AuthBackofficeTokenClaims` |

Algoritmo: **HS256** | Secret: env `JWT_SECRET` | TTL: env `JWT_EXPIRES_IN_HOURS` (default 24h)

## BcryptProvider
Arquivo: `providers/bcrypt_provider.go`

- `Hash(password)` — armazena hash na coluna `password_hash`
- `Compare(password, hash)` — usado no login

## TokenProvider
Arquivo: `providers/token_provider.go`

- Gera tokens seguros com SHA-256 para email verification e password reset
- Tokens nunca são armazenados em texto puro — apenas o hash vai ao banco
- Expiry e `used_at` controlados pela tabela `tokens`

## EmailValidationProvider
Arquivo: `providers/email_validation_provider.go`

- Valida formato de email

## MailProvider
Arquivo: `providers/mail_provider.go`

- Abstração sobre `mailer.Mailer` para envio de emails transacionais
- Usado por `user.UserService` para emails de verificação e reset
