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

Status possíveis: `"Inscrito"` / `"Lista de Espera"` / `"Aguardando Aprovação"` / `"Cancelado"`

---

## Habilitação por evento
Campo `has_signin bool` no modelo `Event` — apenas eventos com `has_signin=true` aparecem na listagem de inscrição.  
Campo `max_participants uint` — `0` = sem limite; valor > 0 = vagas disponíveis.

---

## Fluxo — Site Público (Profile)

Página: `front-site/src/pages/Profile/index.tsx`

1. `signinEventsAPI.getSigninEvents()` → `GET /api/signin-events` — lista eventos inscritiveis
2. `signinEventsAPI.getMySignins()` → `GET /api/signin-events/me` — inscrições ativas do usuário
3. Para cada evento: exibe botão "Inscrever-se" ou status + botão "Desistir"
   - `"Inscrito"` → "Você está inscrito"
   - `"Lista de Espera"` → "Você está na lista de espera (Nª posição)"
   - `"Aguardando Aprovação"` → se PAPFE aprovado: "Você deve confirmar a sua presença no Fernão"; senão: "Traga 1kg de alimento para confirmar sua inscrição na entrada do Fernão"
4. `signinEventsAPI.createSignin(eventName, eventInitDate)` → `POST /api/signin-events`
5. `signinEventsAPI.deleteSignin(eventName, eventInitDate)` → `DELETE /api/signin-events/:eventName/:eventInitDate`

Arquivo de API: `front-site/src/api/signinEvents.ts` (importado diretamente, não pelo barrel)  
Tipo: `front-site/src/types/SigninEventType.ts`

---

## Lógica de Fila (Backend)

- Se `max_participants > 0` e `countActiveByEvent >= max_participants` → inscrição com `StatusWaitListed`; `UserWaitListPosition` = contagem de espera atual + 1
- Cancelamento de `"Inscrito"` confirmado → `GetFirstWaitListed` → `PromoteToRegistered` (primeiro da fila promovido automaticamente)
- Cancelamento de `"Lista de Espera"` → apenas marca como `"Cancelado"`
- Status `"Aguardando Aprovação"` (`StatusWaitingDonation`): inscrição pendente de confirmação presencial no Fernão (1kg de alimento ou PAPFE aprovado)

### Rotar Fila (Admin)
`POST /admin/signin-events/rotate/:eventName/:eventInitDate` — remove inscrições `"Aguardando Aprovação"` e promove os primeiros da lista de espera até preencher vagas.  
**Guarda**: rejeitado com 400 se evento tem `max_participants = 0` (vagas ilimitadas).

Repository: `Create`, `GetByUserEventAndInitDate`, `CountByStatus`, `CountActiveByEvent`, `FindActiveByUser`, `UpdateStatus`, `GetFirstWaitListed`, `PromoteToRegistered`, `DeleteByStatus`

---

## Fluxo — Backoffice (CRUD Admin)

Seção: `"Inscrições"` | Página: `front-backoffice/src/pages/EventRegistration/index.tsx`  
Tab em `Tabs.tsx` (key: `"event-registration"`) → rota `/admin/event-registration` com `RequirePermission("Inscrições")`.

Funcionalidades:
- Seletor de evento (dropdown com eventos que têm `has_signin=true` via `getSigninableEvents()`)
- Quando evento selecionado: exibe info do evento + botão "Rodar fila" (desabilitado para vagas ilimitadas)
- Tabela CRUD filtrada pelo evento ou global
- Status `"Aguardando Aprovação"` renderizado em badge azul

| Método | Path | Guard | Handler TS |
|---|---|---|---|
| GET | `/admin/signin-events` | PermR | `signinEventsAPI.getAll(...)` |
| GET | `/admin/signin-events/events` | PermR | `signinEventsAPI.getSigninableEvents()` |
| GET | `/admin/signin-events/:userNumber/:eventName/:eventInitDate` | PermR | — |
| POST | `/admin/signin-events` | PermRW | `signinEventsAPI.create(item)` |
| POST | `/admin/signin-events/rotate/:eventName/:eventInitDate` | PermRW | `signinEventsAPI.rotate(name, date)` |
| PUT | `/admin/signin-events/:userNumber/:eventName/:eventInitDate` | PermRW | `signinEventsAPI.update(...)` |
| DELETE | `/admin/signin-events/:userNumber/:eventName/:eventInitDate` | PermRW | `signinEventsAPI.delete(...)` |

Arquivo de API: `front-backoffice/src/api/signinEvent.ts` (não está no barrel `index.ts`)  
Tipo: `front-backoffice/src/types/SigninEventType.ts`  
Campos CRUD: `front-backoffice/src/data/eventRegistrationCrudField.ts` (`fields` global / `fieldsForEvent` por evento)

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
