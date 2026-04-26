nota para mim mesmo (daniel): trocar todas as ocorrências de "---" por um exemplo real de campo de seção

# Section API

Documentacao das rotas de seção do backend.

## Entidade Section

A tabela de seção é composta por:

- `Name`: Nome da seção.
- `Description`: Descrição da seção.

---

## 1) Criar seção [ADMIN]

- **Metodo**: `POST`
- **Rota**: `/admin/sections`
- **Body (JSON)**:

```json
{
  "name": "---",
  "description": "---",
}
```

Resposta de sucesso (`201`):

```json
{
  "message": "Seção criada com sucesso!",
  "section": {
    "name": "---",
    "description": "---"
  }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}`
- `500`: `{"error":"..."}`

---

## 2) Listar seções [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/sections`
- **Query params**:
  - `page` (opcional, default `1`, minimo `1`)
  - `limit` (opcional, default `10`, minimo `1`)
  - `sort_by` (opcional, default `name`)
  - `sort_order` (opcional, default `asc`)
  - `search_by` (opcional, usado com `search_value`)
  - `search_value` (opcional, usado com `search_by`)

### Campos permitidos em `sort_by`

- `name`
- `description`

### Valores permitidos em `sort_order`

- `asc`
- `desc`

### Busca (`search_by` + `search_value`)

Deve ser usado **um campo por vez**.

Campos permitidos em `search_by`:

- `name`
- `description`

Exemplo:

`GET /admin/sections?page=1&limit=10&sort_by=name&sort_order=asc&search_by=name&search_value=---` 

Resposta de sucesso (`200`):

```json
{
  "page": 1,
  "limit": 10,
  "sort_by": "name",
  "sort_order": "asc",
  "search_by": "name",
  "search_value": "---",
  "total_records": 8,
  "filtered_records": 1,
  "sections": [
    {
      "name": "--- ",
      "description": "---"
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

---

## 3) Buscar seção específica [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/sections/:sectionName`

Exemplo:

`GET /admin/sections/---`

Resposta de sucesso (`200`):

```json
{
  "name": "---",
  "description": "---"
}
```

Erros comuns:

- `404`: `{"error":"Seção não encontrada"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## 4) Atualizar seção [ADMIN]

- **Metodo**: `PUT`
- **Rota**: `/admin/sections/:sectionName`
- **Body (JSON)**: mesmo formato da criacao

Exemplo:

`PUT /admin/sections/---`

```json
{
  "name": "---",
  "description": "---"
}
```

Resposta de sucesso (`200`):

```json
{
  "message": "Seção atualizada com sucesso!",
  "section": {
    "name": "---",
    "description": "---"
  }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}`
- `404`: `{"error":"Seção não encontrada"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## 5) Deletar seção [ADMIN]

- **Metodo**: `DELETE`
- **Rota**: `/admin/sections/:sectionName`

Exemplo:

`DELETE /admin/sections/---`

Resposta de sucesso (`200`):

```json
{
  "message": "Seção removida com sucesso!"
}
```

Erros comuns:

- `404`: `{"error":"Seção não encontrada"}`
- `500`: `{"error":"Erro interno do servidor"}`

---

## Observacoes

- As rotas em `/admin/...` estao agrupadas como admin no router e exigem Token Backoffice.
- O campo `name` é o identificador único da seção.
