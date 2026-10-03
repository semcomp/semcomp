---
type: wiki-overview
tags: [overview, monorepo, architecture, golang, react, vite]
---
# Visão Geral

## Monorepo
Raiz: `semcomp/new-site/packages/`

| Pacote | Stack | Porta dev | Propósito |
|---|---|---|---|
| `backend` | Go + Gin + GORM | **4000** | API REST + PostgreSQL |
| `front-site` | React 18 + Vite + TS | **5173** | Site público do participante |
| `front-backoffice` | React 18 + Vite + TS | **5174** (base `/admin`) | Painel administrativo |

## Toggle de URL (ambos os frontends)
Arquivo: `front-*/src/constants/ApiURL.tsx`

Controlado pela variável de ambiente Vite:
- `VITE_DEBUG_MODE=true` → `http://localhost:4000`
- `VITE_DEBUG_MODE` ausente/diferente de `"true"` → `https://semcomp.icmc.usp.br/api`

## Autenticação — Dois Fluxos JWT Isolados
| Fluxo | Endpoint | Token localStorage | Claims |
|---|---|---|---|
| Site | `POST /login` | `semcomp-site-token` | `{ id: uint, sub: email }` |
| Backoffice | `POST /admin/login` | `semcomp-backoffice-token` | `{ sub: email }` + retorna `permissions[]` |

Tokens HS256, TTL configurado por `JWT_EXPIRES_IN_HOURS` (default 24h), secret `JWT_SECRET`.

## Backend — Domínios
→ Detalhes em [[Backend_Arquitetura]]

| Módulo | Responsabilidade |
|---|---|
| `auth` | Login/profile do participante |
| `authBackoffice` | Login admin + retorna permissões |
| `user` | CRUD participantes + email verification + password reset |
| `userBackoffice` | CRUD admins |
| `event` | CRUD eventos (PK composta: name+initDate) |
| `presence` | Registro de presença (PK tripla) |
| `section` | Trilhas/categorias de eventos |
| `permission` | RBAC por seção (`"R"` / `"RW"`) |
| `product` | Catálogo de produtos (KIT/COFFEE/COMBO) |
| `payment` | Pagamento PIX via Mercado Pago |
| `signinEvent` | Inscrições em eventos com fila de espera |
| `sponsor` | CRUD de patrocinadores + pacotes por ano |
| `sitestat` | Contador de visitas (key/value) |
| `pages` | Feature flags / toggle de páginas |
| `token` | Tokens de verificação de email e reset de senha |
| `mailer` | Envio de emails via SMTP |
| `log` | Auditoria automática de requisições |

## Frontend — Site Público
→ Ver [[Site_Paginas_e_Rotas]], [[Site_Contextos_Auth]] e [[Site_Contextos_UI]]

Rotas principais: `/` Home, `/cronograma`, `/login`, `/verify-email`, `/reset-password`, `/profile` (auth), `/loja` + `/loja/carrinho` + `/loja/checkout` (auth + feature flag)

## Frontend — Backoffice
→ Ver [[Backoffice_Paginas_e_Rotas]] e [[Backoffice_Contextos_e_Lib]]

8 módulos CRUD em `/admin/*`, cada um protegido por `RequirePermission(section)`:
Eventos, Usuários Backoffice, Usuários Semcomp, Participações, Permissões, Páginas, Patrocinadores, PAPFE
