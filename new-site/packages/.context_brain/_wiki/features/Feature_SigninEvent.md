---
type: feature-flow
tags: [feature, signin, inscricao, eventos, fila, site, backoffice]
---
# Feature: Inscrição em Eventos (SigninEvent)

Permite que participantes se inscrevam em eventos com vagas limitadas, com fila de espera automática.

---

## Entidade
→ [[Backend_Modelos_Core#SigninEvent]]

Tabela: `signin_events` | PK tripla: `UserNumber + EventName + EventInitDate`

Status possíveis: `"Inscrito"` / `"Lista de Espera"` / `"Cancelado"`

---

## Habilitação por evento
Campo `has_signin bool` no modelo `Event` — apenas eventos com `has_signin=true` aparecem na listagem de inscrição.  
Campo `max_participants uint` — `0` = sem limite; valor > 0 = vagas disponíveis.

---

## Fluxo — Site Público (Profile)

Página: `front-site/src/pages/Profile/index.tsx`

1. `signinEventsAPI.getSigninEvents()` → `GET /api/signin-events` — lista eventos inscritiveis
2. `signinEventsAPI.getMySignins()` → `GET /api/signin-events/me` — inscrições ativas do usuário
3. Para cada evento: exibe botão "Inscrever-se" ou status ("Inscrito" / "Lista de Espera - Nª posição") + botão "Desistir"
4. `signinEventsAPI.createSignin(eventName, eventInitDate)` → `POST /api/signin-events`
5. `signinEventsAPI.deleteSignin(eventName, eventInitDate)` → `DELETE /api/signin-events/:eventName/:eventInitDate`

Arquivo de API: `front-site/src/api/signinEvents.ts` (importado diretamente, não pelo barrel)  
Tipo: `front-site/src/types/SigninEventType.ts`

---

## Lógica de Fila (Backend)

- Se `max_participants > 0` e `countActiveByEvent >= max_participants` → inscrição com `StatusWaitListed`; `UserWaitListPosition` = contagem de espera atual + 1
- Cancelamento de `"Inscrito"` confirmado → `GetFirstWaitListed` → `PromoteToRegistered` (primeiro da fila promovido automaticamente)
- Cancelamento de `"Lista de Espera"` → apenas marca como `"Cancelado"`

Repository: `Create`, `GetByUserEventAndInitDate`, `CountByStatus`, `CountActiveByEvent`, `FindActiveByUser`, `UpdateStatus`, `GetFirstWaitListed`, `PromoteToRegistered`

---

## Fluxo — Backoffice (CRUD Admin)

Seção: `"Inscrições"` | Sem tab no `Tabs.tsx` — acesso direto via API

| Método | Path | Guard |
|---|---|---|
| GET | `/admin/signin-events` | PermR |
| GET | `/admin/signin-events/:userNumber/:eventName/:eventInitDate` | PermR |
| POST | `/admin/signin-events` | PermRW |
| PUT | `/admin/signin-events/:userNumber/:eventName/:eventInitDate` | PermRW |
| DELETE | `/admin/signin-events/:userNumber/:eventName/:eventInitDate` | PermRW |

---

## Endpoints Site (autenticados, `/api`)

Todos com guard: `AuthMiddleware` + `pageMW("profile")` + `pageMW("cronograma")`

| Método | Path | Handler TS |
|---|---|---|
| GET | `/api/signin-events` | `signinEventsAPI.getSigninEvents()` |
| GET | `/api/signin-events/me` | `signinEventsAPI.getMySignins()` |
| POST | `/api/signin-events` | `signinEventsAPI.createSignin(name, date)` |
| DELETE | `/api/signin-events/:eventName/:eventInitDate` | `signinEventsAPI.deleteSignin(name, date)` |

→ [[Integracao_API_Site#Rotas Site Autenticadas]]
