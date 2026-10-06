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

- Se `max_participants > 0` e `count >= max_participants` → inscrição com `StatusWaitListed`; `UserWaitListPosition` = contagem atual + 1
- Se `max_participants > 0` e há vagas → inscrição com `StatusWaitingDonation`
- Cancelamento de `StatusRegistered` ou `StatusWaitingDonation` → promove primeiro `StatusWaitListed` com posição ≤ max para `StatusWaitingDonation`
- Cancelamento de `StatusWaitListed` → apenas decrementa posições e marca como `StatusCancelled`
- Status `"Aguardando Aprovação"` (`StatusWaitingDonation`): inscrição pendente de confirmação presencial no Fernão

### Invariantes de Segurança

**Posição não é controlável pelo usuário.** `UserWaitListPosition` é computada server-side como `count+1` dentro da transação com advisory lock — não está no DTO de criação (`CreateSigninRequest` tem apenas `event_name` e `event_init_date`).

**`userNumber` vem do JWT**, nunca do body — um usuário não consegue se inscrever como outro.


### Rotar Fila (Admin)
`POST /admin/signin-events/rotate/:eventName/:eventInitDate` — remove inscrições `"Aguardando Aprovação"` e promove os primeiros da lista de espera até preencher vagas.  
**Guarda**: rejeitado com 400 se evento tem `max_participants = 0` (vagas ilimitadas).

**Detalhe de design**: promoção via rotação vai direto para `StatusRegistered` ("Inscrito"), **não** para `StatusWaitingDonation`. Isso é intencional — a rotação ocorre após o prazo de doação, então os novos promovidos são registrados sem exigir confirmação presencial. Contrasta com a promoção por cancelamento de usuário (`RemoveAtomicSignin`), que promove para `StatusWaitingDonation` porque ainda há tempo para o ciclo de doação.

---

## Concorrência — Advisory Locks (PostgreSQL)

Todas as operações que modificam a fila usam `pg_advisory_xact_lock` dentro de transações.

### Criação (`CreateAtomicSignin`)
Dois locks adquiridos em ordem fixa (previne deadlock):
1. **Lock por usuário** — `pg_advisory_xact_lock(int64(userNumber))` — serializa todas as tentativas de inscrição simultâneas do mesmo usuário, eliminando a race TOCTOU no check de eventos concomitantes.
2. **Lock por evento** — `pg_advisory_xact_lock(hashtext(eventName), hashtext(initDate))` — serializa contagem de vagas e insert.

Dentro da transação (sob ambos os locks):
- Check de inscrição duplicada → `ErrDuplicateInscription`
- Check de eventos concomitantes (join com `events`) → `ErrOverlappingInscription`
- Contagem de ativos → atribuição de `UserWaitListPosition` e `Status`
- Insert

### Remoção (`RemoveAtomicSignin`)
Lock por evento adquirido antes de: fetch, delete, `DecrementPositionsAfter`, `PromoteWithinLimit` — tudo dentro de uma única transação. Elimina a race entre cancelamento e inscrição simultânea que causava overbooking.

### Rotação (`RotateAtomicSignins`)
Lock por evento adquirido antes de: delete `WaitingDonation`, contagem de `Registered`, promoção de waitlisted, reordenação de posições por window function (`ROW_NUMBER() OVER`). Tudo em uma única transação.

### Criação Admin (`CreateAdminSignin`)
Lock por evento (sem lock por usuário — admin bypassa o check de sobreposição). Duplicate check + count + insert atomicamente.

---

## Repository

Interface atual (8 métodos):

| Método | Descrição |
|---|---|
| `CreateAtomicSignin(userNumber, eventName, initDate, maxParticipants, targetEndDate)` | Inscrição pública — dois advisory locks + checks + insert |
| `CreateAdminSignin(userNumber, eventName, initDate, status)` | Inscrição admin — lock por evento + duplicate check + insert |
| `RemoveAtomicSignin(userNumber, eventName, initDate, maxParticipants)` | Remoção atômica — lock por evento + delete + decrement + promote |
| `GetByUserEventAndInitDate(userNumber, eventName, initDate)` | Busca por chave composta |
| `FindActiveByUser(userNumber)` | Lista inscrições ativas com join em `events` |
| `UpdateByComposite(userNumber, eventName, initDate, updated)` | Atualiza campos por chave composta |
| `GetAll(query)` | Lista paginada com filtros (backoffice) |
| `RotateAtomicSignins(eventName, initDate, maxParticipants)` | Rotação atômica da fila |

Erros sentinela do pacote: `ErrDuplicateInscription`, `ErrOverlappingInscription`

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
| PUT | `/admin/signin-events/:userNumber/:eventName/:eventInitDate/register` | PermRW | `signinEventsAPI.register(...)` |
| DELETE | `/admin/signin-events/:userNumber/:eventName/:eventInitDate` | PermRW | `signinEventsAPI.delete(...)` |

Arquivo de API: `front-backoffice/src/api/signinEvent.ts` (não está no barrel `index.ts`)  
Tipo: `front-backoffice/src/types/SigninEventType.ts`  
Campos CRUD: `front-backoffice/src/data/eventRegistrationCrudField.ts` (`fields` global / `fieldsForEvent` por evento)

---

## Fluxo — Backoffice (Confirmações de Presença)

Seção: `"Confirmações de Inscrição"` | Página: `front-backoffice/src/pages/ConfirmRegistrations/index.tsx`  
Tab em `Tabs.tsx` (key: `"confirm-registrations"`) → rota `/admin/confirm-registrations` com `RequirePermission("Confirmações de Inscrição")`.

Responsabilidade: confirmar presença de participantes que chegaram ao Fernão com 1kg de alimento. Apenas inscrições com status `"Aguardando Aprovação"` aparecem nesta tela. Ao aprovar, o status muda para `"Inscrito"`.

Funcionalidades:
- Seletor de evento (dropdown via `confirmationsAPI.getSigninableEvents()`)
- Sem evento selecionado: exibe todas as inscrições `"Aguardando Aprovação"` (todos os eventos)
- Com evento selecionado: filtra client-side por `eventName + eventInitDate` sobre a mesma consulta
- Botão "Aprovar" por linha → modal de confirmação → `confirmationsAPI.approve()`

| Método | Path | Guard | Handler TS |
|---|---|---|---|
| GET | `/admin/confirmations` | PermR (`Confirmações de Inscrição`) | `confirmationsAPI.getAll(...)` |
| GET | `/admin/confirmations/events` | PermR (`Confirmações de Inscrição`) | `confirmationsAPI.getSigninableEvents()` |
| PUT | `/admin/confirmations/:userNumber/:eventName/:eventInitDate` | PermRW (`Confirmações de Inscrição`) | `confirmationsAPI.approve(...)` |

Esses endpoints são aliases dos handlers de `signinEvent`: `GET /admin/confirmations` → `GetSigninsAdmin`, `GET /admin/confirmations/events` → `GetSigninEvents`, `PUT /admin/confirmations/:...` → `RegisterSigninAdmin`.

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
