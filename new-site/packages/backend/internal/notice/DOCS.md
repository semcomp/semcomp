# Notice API

Documentação das rotas de aviso (do mural de avisos) do backend.

## Entidade Notice

A tabela de aviso é composta por:

- `id`: Identificador único (auto-increment)
- `title`: Título do aviso
- `content`: Conteúdo do aviso
- `date_time`: Data e hora do aviso

## Formato de data

- O backend espera datas em **RFC3339** (ex.: `2026-07-10T14:00:00Z`).
- Nas rotas com `:dateTime`, envie a data no mesmo formato.

---

## 1) Criar aviso [ADMIN]

- **Metodo**: `POST`
- **Rota**: `/admin/notices`
- **Body (JSON)**:

```json
{
  "title": "Aviso de exemplo",
  "content": "Conteúdo do aviso de exemplo",
  "date_time": "2026-07-10T14:00:00Z"
}
```

Resposta de sucesso (`201`):

```json (mensagem de confirmacao da criacao)
{
  "message": "Aviso criado com sucesso!",
  "notice": {
    "id": 1,
    "title": "Aviso de exemplo",
    "content": "Conteúdo do aviso de exemplo",
    "date_time": "2026-07-10T14:00:00Z"
  }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}`
- `500`: `{"error":"..."}`

---

## 2) Listar avisos [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/notices`
- **Query params**:
  - `page` (opcional, default `1`, minimo `1`)
  - `limit` (opcional, default `10`, minimo `1`)
  - `sort_by` (opcional, default `date_time`)
  - `sort_order` (opcional, default `desc`)
  - `search_by` (opcional, usado com `search_value`)
  - `search_value` (opcional, usado com `search_by`)

### Campos permitidos em `sort_by`

- `id`
- `title`
- `content`
- `date_time`

### Valores permitidos em `sort_order`

- `asc`
- `desc`

### Busca (`search_by` + `search_value`)

Deve ser usado **um campo por vez**.

Campos permitidos em `search_by`:

- `id`
- `title`
- `content`
- `date_time` (valor em RFC3339)

Exemplo:

`GET /admin/notices?page=1&limit=10&sort_by=title&sort_order=asc&search_by=title&search_value=Aviso`

Resposta de sucesso (`200`):

```json (confirmacao de resposta)
{
  "notices": [
    {
      "id": 1,
      "title": "Aviso de exemplo",
      "content": "Conteúdo do aviso de exemplo",
      "date_time": "2026-07-10T14:00:00Z"
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
- `{"error":"invalid search_value for date_time, use RFC3339"}`

---

## 3) Buscar aviso específico [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/notices/:id`

Exemplo:

`GET /admin/notices/1`

Resposta de sucesso (`200`):

```json (confirmacao de busca)
{
  "id": 1,
  "title": "Aviso de exemplo",
  "content": "Conteúdo do aviso de exemplo",
  "date_time": "2026-07-10T14:00:00Z"
}
```

Erros comuns:

- `400`: `{"error":"Parâmetro 'id' inválido"}`
- `404`: `{"error":"Aviso não encontrado"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## 4) Atualizar aviso [ADMIN]

- **Metodo**: `PUT`
- **Rota**: `/admin/notices/:id`
- **Body (JSON)**: mesmo formato da criacao

Exemplo:

`PUT /admin/notices/1`

```json
{
  "title": "Aviso de exemplo atualizado",
  "content": "Conteúdo do aviso de exemplo atualizado",
  "date_time": "2026-07-10T14:00:00Z"
}
```

Resposta de sucesso (`200`):

```json (confirmacao de atualizacao)
{
  "message": "Aviso atualizado com sucesso!",
  "notice": {
    "id": 1,
    "title": "Aviso de exemplo atualizado",
    "content": "Conteúdo do aviso de exemplo atualizado",
    "date_time": "2026-07-10T14:00:00Z"
  }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}` ou `{"error":"Parâmetro 'id' inválido"}`
- `404`: `{"error":"Aviso não encontrado"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## 5) Deletar aviso [ADMIN]

- **Metodo**: `DELETE`
- **Rota**: `/admin/notices/:id`

Exemplo:

`DELETE /admin/notices/1`

Resposta de sucesso (`200`):

```json (confirmacao de delecao)
{
  "message": "Aviso removido com sucesso!"
}
```

Erros comuns:

- `400`: `{"error":"Parâmetro 'id' inválido"}`
- `404`: `{"error":"Aviso não encontrado"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## Observacoes

- As rotas em `/admin/...` estao agrupadas como admin no router.
