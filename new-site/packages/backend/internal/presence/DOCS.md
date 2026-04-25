# Presence API

Documentacao das rotas de presencas do backend.

## Entidade Presence

A tabela de presenca é composta por:

- `Name`: Nome do usuário.
- `EventName`: Nome do evento.
- `EventDateTime`: Data e hora do evento.
- `EmailAdmin`: Email do usuário backoffice que cadastrou a presença.

## Formato de data

- O backend espera datas em **RFC3339** (ex.: `2026-07-10T14:00:00Z`).
- Nas rotas com `:eventDate`, envie a data no mesmo formato.

---

## 1) Criar presenca [ADMIN]

- **Metodo**: `POST`
- **Rota**: `/admin/presences`
- **Body (JSON)**:

```json
{
  "name": "Fulano de Ciclano",
  "event_name": "Workshop A",
  "event_date_time": "2026-07-10T14:00:00Z",
  "email_admin": "Example@semcomp.com",
}
```

Resposta de sucesso (`201`):

```json (mensagem de confirmacao da criacao)
{
  "message": "Presença criada com sucesso!",
  "presence": {
    "name": "Fulano de Ciclano",
    "event_name": "Workshop A",
    "event_date_time": "2026-07-10T14:00:00Z",
    "email_admin": "Example@semcomp.com"
  }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}`
- `500`: `{"error":"..."}`

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

- `name`
- `event_name`
- `event_date_time`
- `email_admin`

### Valores permitidos em `sort_order`

- `asc`
- `desc`

### Busca (`search_by` + `search_value`)

Deve ser usado **um campo por vez**.

Campos permitidos em `search_by`:

- `name`
- `event_name`
- `event_date_time` (valor em RFC3339)
- `email_admin`

Exemplo:

`GET /presences?page=1&limit=10&sort_by=name&sort_order=desc&search_by=event_name&search_value=Workshop`

Resposta de sucesso (`200`):

```json (confirmacao de resposta)
[
  {
    "name": "Fulano de Ciclano",
    "event_name": "Workshop A",
    "event_date_time": "2026-07-10T14:00:00Z",
    "email_admin": "Example@semcomp.com"
  }
]
```

Erros comuns (`400`):

- `{"error":"Parâmetro 'page' inválido"}`
- `{"error":"Parâmetro 'limit' inválido"}`
- `{"error":"invalid sort_by parameter"}`
- `{"error":"invalid sort_order parameter"}`
- `{"error":"search_by and search_value must be provided together"}`
- `{"error":"invalid search_by parameter"}`
- `{"error":"invalid search_value for date_time, use RFC3339"}`
- `{"error":"invalid search_value for has_attendance"}`

---

## 3) Buscar presenca especifica [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/presences/:name/:eventName/:eventDate`

Exemplo:

`GET /presences/Pedro/Workshop%20A/2026-07-10T14:00:00Z`

Resposta de sucesso (`200`):

```json (confirmacao de busca)
{
  "name": "Fulano de Ciclano",
  "event_name": "Workshop A",
  "event_date_time": "2026-07-10T14:00:00Z",
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
- **Rota**: `/admin/presences/:name/:eventName/:eventDate`
- **Body (JSON)**: mesmo formato da criacao

Exemplo:

`PUT /admin/presences/Fulano%20de%20Ciclano/Workshop%20A/2026-07-10T14:00:00Z`

```json
{
  "name": "Fulano de Ciclano",
  "event_name": "Workshop Golang",
  "event_date_time": "2026-07-10T16:00:00Z",
  "email_admin": "Example@semcomp.com",
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
- **Rota**: `/admin/presences/:name/:eventName/:eventDate`

Exemplo:

`DELETE /admin/presences/Fulano%20de%20Ciclano/Workshop%20A/2026-07-10T14:00:00Z`

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
