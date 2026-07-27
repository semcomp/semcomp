---
type: wiki-models
tags: [backend, models, golang, gorm, database, core]
---
# Backend — Modelos Core

Entidades presentes na maioria das tarefas: participantes, eventos, presença, admins, audit.

---

## User
Tabela: `users` | Arquivo: `internal/user/model.go`

| Campo | JSON | Notas |
|---|---|---|
| `UserNumber` PK | `user_number` | uint, auto-increment |
| `Name` | `name` | size:100 |
| `Email` | `email` | unique, size:150 |
| `PasswordHash` | — | omitido nas respostas |
| `Age` | `age` | int, not null |
| `Gender` | `gender` | size:50 |
| `City` | `city` | size:100 |
| `Education` | `education` | size:100 |
| `HasPapfe` | `hasPapfe` | bool |
| `Disabilities` | `disabilities` | text, default:"" |
| `Profession` | `profession` | *string, nullable |
| `Linkedin` | `linkedin` | *string, nullable |
| `Telegram` | `telegram` | *string, nullable |
| `PresenceRate` | `presence_rate` | float64 |
| `EmailVerified` | `email_verified` | bool, default:false |

**Campos internos de verificação** (não expostos): `VerificationTokenHash`, `VerificationTokenExpiresAt`, `VerificationSentAt`, `VerificationWindowStartAt`, `VerificationSendCount`

**SafeUser** (exposto pela API): todos acima exceto `PasswordHash` e campos de verificação. `UserNumber` formatado como `%05d` (string).

### PapfeDocument
Tabela: `papfe_documents` — comprovante PAPFE armazenado como `bytea`.  
FK → `users.Email` ON DELETE CASCADE. Sem handler HTTP público — manipulado via multipart no cadastro.

---

## UserBackoffice
Tabela: `users_backoffice` | Arquivo: `internal/userBackoffice/model.go`

| Campo | JSON |
|---|---|
| `Email` PK | `email` |
| `PasswordHash` | — |

**SafeUserB**: `{ email }` — nome derivado do email no frontend (`email.split("@")[0]`).

---

## Event
Tabela: `events` | Arquivo: `internal/event/model.go`  
**PK composta**: `Name + InitDate`

| Campo | JSON | Notas |
|---|---|---|
| `Name` PK | `name` | size:200 |
| `InitDate` PK | `init_date` | timestamptz, RFC3339 |
| `EndDate` | `end_date` | timestamptz |
| `Type` | `type` | size:50 |
| `Location` | `location` | |
| `Description` | `description` | text |
| `HasAttendance` | `has_attendance` | bool |

---

## Presence
Tabela: `presences` | Arquivo: `internal/presence/model.go`  
**PK tripla**: `UserNumber + EventName + EventInitDate`

| Campo | JSON |
|---|---|
| `UserNumber` PK | `user_number` (int64) |
| `EventName` PK | `event_name` |
| `EventInitDate` PK | `event_init_date` |
| `EmailAdmin` | `email_admin` |

---

## Section
Tabela: `sections` | Arquivo: `internal/section/model.go`

| Campo | JSON |
|---|---|
| `Name` PK | `name` |
| `Description` | `description` |

Inicializada por `InitializeSections()` na startup.

---

## AuditLog
Tabela: `audit_logs` | Arquivo: `internal/log/model.go`  
Preenchida automaticamente pelo `AuditMiddleware` em toda requisição.

| Campo | Notas |
|---|---|
| `ID` PK | auto |
| `UserNumber` | nullable |
| `UserEmail` | nullable |
| `StatusCode` | HTTP status |
| `Method` | GET/POST/... |
| `Path` | endpoint |
| `LatencyMs` | ms |
| `Message` | response message |

---

## JWT Claims

| Struct | Campos | Middleware |
|---|---|---|
| `AuthTokenClaims` | `UserNumber uint` + `Email string` | `AuthMiddleware` (site) |
| `AuthBackofficeTokenClaims` | `Email string` | `AuthBackofficeMiddleware` |

→ Detalhes do provider: [[Backend_Providers]]

---

## Padrão ListQuery / ListResult

Query params: `page`, `limit`, `sort_by`, `sort_order`, `search_by`, `search_value`  
Resposta: `{ page, limit, total_records, filtered_records, <entidades>[] }`
