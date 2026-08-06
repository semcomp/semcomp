---
type: raw-envs
tags: [backend, environment, config, secrets, golang]
---
# Backend — Variáveis de Ambiente

Todas as variáveis são lidas via `os.Getenv()` na startup.  
→ Visão de módulos que as usam: [[Backend_Arquitetura]]

---

## Banco de Dados (PostgreSQL)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DB_HOST` | ✅ | Host PostgreSQL |
| `DB_USER` | ✅ | Usuário PostgreSQL |
| `DB_PASSWORD` | ✅ | Senha |
| `DB_NAME` | ✅ | Nome do banco |
| `DB_PORT` | ✅ | Porta (ex: 5432) |

---

## Autenticação JWT

| Variável | Obrigatória | Default | Descrição |
|---|---|---|---|
| `JWT_SECRET` | ✅ | — | Secret HS256 para assinar tokens |
| `JWT_EXPIRES_IN_HOURS` | — | 24 | TTL do JWT em horas |

---

## Admin Padrão

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ADMIN_EMAIL` | ✅ | Email do admin criado na startup via `InitializeAdmin()` |
| `ADMIN_PASSWORD` | ✅ | Senha do admin padrão |

---

## URLs

| Variável | Obrigatória | Descrição |
|---|---|---|
| `FRONTEND_URL` | ✅ | URL base do front-site (usado em links de email — verify + reset) |
| `BACKEND_URL` | — | URL base do backend (uso interno) |

---

## SMTP (Email)

| Variável | Obrigatória | Default | Descrição |
|---|---|---|---|
| `SMTP_HOST` | ✅ | — | Host SMTP |
| `SMTP_PORT` | — | 587 | Porta SMTP |
| `SMTP_USER` | ✅ | — | Usuário SMTP |
| `SMTP_PASSWORD` | ✅ | — | Senha SMTP |
| `SMTP_FROM` | ✅ | — | Endereço remetente |

---

## Mercado Pago

| Variável | Obrigatória | Descrição |
|---|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | ✅ | Token de acesso à API do MP |
| `MERCADOPAGO_WEBHOOK_SECRET` | ✅ | Secret para validar assinatura do webhook (header `x-signature`) |

---

## Verificação de Email

| Variável | Obrigatória | Descrição |
|---|---|---|
| `EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_HOURS` | — | TTL do token de verificação |
| `EMAIL_VERIFICATION_MAX_RESENDS_PER_DAY` | — | Limite de reenvios diários por usuário |
| `EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS` | — | Cooldown entre reenvios |

---

## Frontend (Vite)

| Variável | Frontend | Descrição |
|---|---|---|
| `VITE_DEBUG_MODE` | front-site, front-backoffice | `"true"` → URL dev (`localhost:4000`) |
