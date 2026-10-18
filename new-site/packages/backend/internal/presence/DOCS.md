# Presence API

Documentacao das rotas de presencas do backend.

## Entidade Presence

A tabela de presenca é composta por:

- `user_number`: Identificador numérico do usuário.
- `EventName`: Nome do evento.
- `EventInitDate`: Data e hora do início do evento.
- `EmailAdmin`: Email do usuário backoffice que cadastrou a presença.
- `created_at`: Instante em que a presença foi lançada, preenchido automaticamente
  pelo GORM no insert (UTC no banco). Nunca é alterado em um update — o instante
  original é o que interessa para auditar duplicatas. Linhas anteriores à
  introdução da coluna vêm como `null`.

## Regra de inscrição

Quando o evento tem `has_signin = true` (Minicursos, Oficinas…), a
presença só é aceita se o participante tiver uma inscrição (`signin_events`)
naquele evento com status **`Inscrito`**. Sem inscrição, ou com status
`Lista de Espera` / `Aguardando Aprovação` / `Cancelado`, a resposta é `403`.

> **Coffee não usa esta regra.** Coffee não é evento com inscrição
> (`has_signin = false`). O que libera a presença num evento de coffee é ter
> **comprado o produto de coffee** daquele horário — ver a seção "Regra do
> coffee" abaixo.

Eventos sem inscrição (`has_signin = false`, ex.: Palestras, Vitrine) aceitam
qualquer participante.

## Regra do coffee

Coffee não é evento com inscrição — um coffee é um **produto vendido**. Ao
marcar presença num evento de coffee, o sistema exige que o participante tenha
**comprado o produto COFFEE** correspondente, com a venda em status **`PAGO`**
(PENDENTE não conta: bastaria iniciar o checkout sem pagar para liberar).

A associação evento ↔ produto é por **data/hora**: o evento de coffee das 09:00
corresponde ao produto COFFEE cujo `coffees.date_time` é 09:00 daquele dia.

| Situação | Resposta |
|---|---|
| Comprou o coffee do horário (`PAGO`), direto ou via **combo** que o contém | presença liberada |
| Não comprou | `403 {"code":"forbidden","message":"Usuário não comprou o coffee deste evento"}` |
| Evento sem produto de coffee associado (ex.: Palestra) | checagem ignorada, presença liberada |

**Combo conta como posse do coffee.** Quem comprou um COMBO que contém o coffee
daquele horário recebe presença — é o mesmo critério que a loja usa para compra
única (`getUnavailableProductIDs` fecha combo ↔ coffees nos dois sentidos).
Vale só para o coffee que o combo contém: ter comprado um combo não libera
presença em coffees de outros horários.

## Formato de data

- O backend espera datas em **RFC3339** (ex.: `2026-07-10T14:00:00Z`).
- Nas rotas com `:eventInitDate`, envie a data no mesmo formato.

---

## 1) Criar presenca [ADMIN]

- **Metodo**: `POST`
- **Rota**: `/admin/presences`
- **Body (JSON)**:

```json
{
  "user_number": 12345,
  "event_name": "Workshop A",
  "event_init_date": "2026-07-10T14:00:00Z",
  "email_admin": "Example@semcomp.com"
}
```

Resposta de sucesso (`201`):

```json (mensagem de confirmacao da criacao)
{
  "message": "Presença criada com sucesso!",
  "presence": {
    "name": "Fulano de Ciclano",
    "event_name": "Workshop A",
    "event_init_date": "2026-07-10T14:00:00Z",
    "email_admin": "Example@semcomp.com",
    "created_at": "2026-07-10T14:03:21Z"
  }
}
```

Erros comuns:

- `400`: `{"code":"validation_error","message":"Dados da requisição inválidos"}`
- `403`: `{"code":"forbidden","message":"Usuário não está inscrito neste evento"}` — o
  evento exige inscrição (`has_signin = true`) e o participante não tem nenhuma.
  `"Usuário não possui inscrição confirmada neste evento"` quando existe inscrição
  mas o status não é `Inscrito`.
  `"Usuário não comprou o coffee deste evento"` quando o horário tem um produto
  de coffee associado e o participante não o comprou (venda `PAGO`).
- `404`: `{"code":"not_found","message":"Evento não encontrado"}`
- `409`: `{"code":"conflict","message":"Presença já registrada em 06/10/2026 09:00 por admin@semcomp.com"}`
  — já existe presença deste usuário neste evento. A mensagem informa o instante
  (fuso de São Paulo) e o admin que registrou antes. Vale tanto para o caminho
  normal quanto quando dois scans simultâneos disputam a mesma vaga.
- `500`: `{"code":"internal_server_error","message":"Erro ao criar presença"}`

---

## 2) Listar presenca [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/presences`
- **Query params**:
  - `page` (opcional, default `1`, minimo `1`)
  - `limit` (opcional, default `10`, minimo `1`)
  - `sort_by` (opcional, default `date_time`)
  - `sort_order` (opcional, default `asc`)
  - `search_by` (opcional, usado com `search_value`)
  - `search_value` (opcional, usado com `search_by`)

### Campos permitidos em `sort_by`

- `user_number`
- `event_name`
- `event_init_date`
- `email_admin`
- `created_at`

### Valores permitidos em `sort_order`

- `asc`
- `desc`

### Busca (`search_by` + `search_value`)

Deve ser usado **um campo por vez**.

Campos permitidos em `search_by`:

- `user_number`
- `event_name`
- `event_init_date` (valor em RFC3339)
- `email_admin`
- `created_at` (valor em `AAAA-MM-DD` ou RFC3339; a busca é por dia, no fuso de São Paulo)

Exemplo:

`GET /admin/presences?page=1&limit=10&sort_by=user_number&sort_order=desc&search_by=event_name&search_value=Workshop`

Resposta de sucesso (`200`):

```json (confirmacao de resposta)
{
  "Presences": [
    {
      "user_number": 12345,
      "event_name": "Workshop A",
      "event_init_date": "2026-07-10T14:00:00Z",
      "email_admin": "Example@semcomp.com"
    }
  ],
  "TotalRecords": 1,
  "FilteredRecords": 1
}
```

Erros comuns (`400`):

- `{"error":"Parâmetro 'page' inválido"}`
- `{"error":"Parâmetro 'limit' inválido"}`
- `{"error":"invalid sort_by parameter"}`
- `{"error":"invalid sort_order parameter"}`
- `{"error":"search_by and search_value must be provided together"}`
- `{"error":"invalid search_by parameter"}`
- `{"error":"invalid search_value for event_init_time, use RFC3339"}`
- `{"error":"invalid search_value for has_attendance"}`

---

## 3) Buscar presenca especifica [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/presences/:userNumber/:eventName/:eventInitDate`

Exemplo:

`GET /admin/presences/12345/Workshop%20A/2026-07-10T14:00:00Z`

Resposta de sucesso (`200`):

```json (confirmacao de busca)
{
  "user_number": 12345,
  "event_name": "Workshop A",
  "event_init_date": "2026-07-10T14:00:00Z",
  "email_admin": "Example@semcomp.com"
}
```

Erros comuns:

- `400`: `{"error":"invalid event date format"}`
- `404`: `{"error":"presence not found"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## 4) Atualizar presenca [ADMIN]

- **Metodo**: `PUT`
- **Rota**: `/admin/presences/:userNumber/:eventName/:eventInitDate`
- **Body (JSON)**: mesmo formato da criacao

Exemplo:

`PUT /admin/presences/12345/Workshop%20A/2026-07-10T14:00:00Z`

```json
{
  "user_number": 12345,
  "event_name": "Workshop Golang",
  "event_init_date": "2026-07-10T14:00:00Z",
  "email_admin": "Example@semcomp.com"
}
```

Resposta de sucesso (`200`):

```json (confirmacao de atualizacao)
{
  "message": "Presença atualizada com sucesso!"
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}` ou `{"error":"Data inválida. Use o formato RFC3339"}`
- `404`: `{"error":"Evento não encontrado"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## 5) Deletar presenca [ADMIN]

- **Metodo**: `DELETE`
- **Rota**: `/admin/presences/:userNumber/:eventName/:eventInitDate`

Exemplo:

`DELETE /admin/presences/12345/Workshop%20A/2026-07-10T14:00:00Z`

Resposta de sucesso (`200`):

```json (confirmacao de delecao)
{
  "message": "Presença removida com sucesso!"
}
```

Erros comuns:

- `400`: `{"error":"Data inválida. Use o formato RFC3339"}`
- `404`: `{"error":"Evento não encontrado"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## Observacoes

- As rotas em `/admin/...` estao agrupadas como admin no router.
