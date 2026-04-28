# Events API

Documentacao das rotas de eventos do backend.

## Entidade Event

A tabela de eventos é composta por:

- `Name`: Nome do evento.
- `InitDate`: Data e hora do inicio do evento.
- `EndDate`: Data e hora do fim do evento.
- `Type`: Tipo do evento.
- `Location`: Local do evento.
- `Description`: Descricao do evento.
- `HasAttendance`: Indica se o evento tem presenca.

## Formato de data

- O backend espera datas em **RFC3339** (ex.: `2026-07-10T14:00:00Z`).
- Nas rotas com `:initDate`, envie a data no mesmo formato.

---

## 1) Criar evento [ADMIN]

- **Metodo**: `POST`
- **Rota**: `/admin/events`
- **Body (JSON)**:

```json
{
  "name": "Workshop A",
  "init_date": "2026-07-10T14:00:00Z",
  "end_date": "2026-07-10T16:00:00Z",
  "type": "Workshop",
  "location": "Auditorio A",
  "description": "Introducao a Computacao",
  "has_attendance": true
}
```

Resposta de sucesso (`201`):

```json
{
  "message": "Evento criado com sucesso!",
  "event": {
    "name": "Workshop A",
    "init_time": "2026-07-10T14:00:00Z",
    "end_time": "2026-07-10T16:00:00Z",
    "type": "Workshop",
    "location": "Auditorio A",
    "description": "Introducao a Computacao",
    "has_attendance": true
  }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}`
- `500`: `{"error":"..."}`

---

## 2) Listar eventos [PUBLICO]

- **Metodo**: `GET`
- **Rota**: `/events`
- **Query params**:
  - `page` (opcional, default `1`, minimo `1`)
  - `limit` (opcional, default `10`, minimo `1`)
  - `sort_by` (opcional, default `date_time`)
  - `sort_order` (opcional, default `asc`)
  - `search_by` (opcional, usado com `search_value`)
  - `search_value` (opcional, usado com `search_by`)

### Campos permitidos em `sort_by`

- `name`
- `init_date`
- `type`
- `location`
- `description`
- `has_attendance`

### Valores permitidos em `sort_order`

- `asc`
- `desc`

### Busca (`search_by` + `search_value`)

Deve ser usado **um campo por vez**.

Campos permitidos em `search_by`:

- `name`
- `type`
- `location`
- `description`
- `init_date` (valor em RFC3339)
- `has_attendance` (`true` ou `false`)

Exemplo:

`GET /events?page=1&limit=10&sort_by=name&sort_order=desc&search_by=type&search_value=Workshop`

Resposta de sucesso (`200`):

```json
{
  "page": 1,
  "limit": 10,
  "sort_by": "name",
  "sort_order": "desc",
  "search_by": "type",
  "search_value": "Workshop",
  "total_records": 120,
  "filtered_records": 14,
  "events": [
    {
      "name": "Workshop A",
      "init_date": "2026-07-10T14:00:00Z",
      "end_date": "2026-07-10T16:00:00Z",
      "type": "Workshop",
      "location": "Auditorio A",
      "description": "Introducao a Computacao",
      "has_attendance": true
    }
  ]
}
```

Erros comuns (`400`):

- `{"error":"Parâmetro 'page' inválido"}`
- `{"error":"Parâmetro 'limit' inválido"}`
- `{"error":"invalid sort_by parameter"}`
- `{"error":"invalid sort_order parameter"}`
- `{"error":"search_by and search_value must be provided together"}`
- `{"error":"invalid search_by parameter"}`
- `{"error":"invalid search_value for init_time, use RFC3339"}`
- `{"error":"invalid search_value for has_attendance"}`

---

## 3) Buscar evento especifico [PUBLICO]

- **Metodo**: `GET`
- **Rota**: `/event/:eventName/:initDate`

Exemplo:

`GET /event/Workshop%20A/2026-07-10T14:00:00Z`

Resposta de sucesso (`200`):

```json
{
  "name": "Workshop A",
  "init_date": "2026-07-10T14:00:00Z",
  "end_date": "2026-07-10T16:00:00Z",
  "type": "Workshop",
  "location": "Auditorio A",
  "description": "Introducao a Computacao",
  "has_attendance": true
}
```

Erros comuns:

- `400`: `{"error":"Data inválida. Use o formato RFC3339"}`
- `404`: `{"error":"Evento não encontrado"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## 4) Atualizar evento [ADMIN]

- **Metodo**: `PUT`
- **Rota**: `/admin/events/:eventName/:initDate`
- **Body (JSON)**: mesmo formato da criacao

Exemplo:

`PUT /admin/events/Workshop%20A/2026-07-10T14:00:00Z`

```json
{
  "name": "Workshop Golang",
  "init_date": "2026-07-10T14:00:00Z",
  "end_date": "2026-07-10T16:00:00Z",
  "type": "Workshop",
  "location": "Auditorio B",
  "description": "Conteudo atualizado",
  "has_attendance": true
}
```

Resposta de sucesso (`200`):

```json
{
  "message": "Evento atualizado com sucesso!",
  "event": {
    "name": "Workshop Golang",
    "init_time": "2026-07-10T14:00:00Z",
    "end_time": "2026-07-10T16:00:00Z",
    "type": "Workshop",
    "location": "Auditorio B",
    "description": "Conteudo atualizado",
    "has_attendance": true
  }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}` ou `{"error":"Data inválida. Use o formato RFC3339"}`
- `404`: `{"error":"Evento não encontrado"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## 5) Deletar evento [ADMIN]

- **Metodo**: `DELETE`
- **Rota**: `/admin/events/:eventName/:initDate`

Exemplo:

`DELETE /admin/events/Workshop%20A/2026-07-10T14:00:00Z`

Resposta de sucesso (`200`):

```json
{
  "message": "Evento removido com sucesso!"
}
```

Erros comuns:

- `400`: `{"error":"Data inválida. Use o formato RFC3339"}`
- `404`: `{"error":"Evento não encontrado"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## Observacoes

- As rotas em `/admin/...` estao agrupadas como admin no router.
