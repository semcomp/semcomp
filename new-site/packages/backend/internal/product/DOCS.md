# Product API

Documentação das rotas de produto do backend.

## Entidades

### Product (Entidade Base)

| Campo       | Tipo    | Descrição                          |
|-------------|---------|-------------------------------------|
| `id`        | uint    | Identificador único (auto-increment)|
| `type`      | string  | Tipo do produto: `KIT`, `COFFEE`, `COMBO` |
| `is_selling`| bool    | Se o produto está à venda          |
| `price`     | float64 | Preço do produto                   |

### Kit (Especialização - type: KIT)

| Campo        | Tipo   | Descrição                |
|--------------|--------|--------------------------|
| `id`         | uint   | FK referenciando Product |
| `name`       | string | Nome do kit              |
| `size`       | string | Tamanho                  |
| `color`      | string | Cor                      |
| `is_babydoll`| bool   | Se é babydoll            |

### Coffee (Especialização - type: COFFEE)

| Campo      | Tipo      | Descrição                |
|------------|-----------|--------------------------|
| `id`       | uint      | FK referenciando Product |
| `name`     | string    | Nome do coffee           |
| `date_time`| timestamp | Data e hora              |

### ComboItem (Composição - type: COMBO)

| Campo     | Tipo | Descrição                          |
|-----------|------|------------------------------------|
| `combo_id`| uint | FK referenciando Product (combo)   |
| `item_id` | uint | FK referenciando Product (item)    |

**Regras:**
- Um combo não pode conter outro combo como item.
- Um produto não pode ser deletado se for item de algum combo.
> Obs.: Isso tudo se baseia em interpretações minhas (do Daniel) a respeito da modelagem de 'produto'. Válido analisar se vai ser preciso mudar.

---

## 1) Criar produto [ADMIN]

- **Método**: `POST`
- **Rota**: `/admin/products`

### Body - Kit

```json
{
  "type": "KIT",
  "is_selling": true,
  "price": 49.90,
  "kit": {
    "name": "Kit Semcomp 29",
    "size": "M",
    "color": "Preto",
    "is_babydoll": false
  }
}
```

### Body - Coffee

```json
{
  "type": "COFFEE",
  "is_selling": true,
  "price": 15.00,
  "coffee": {
    "name": "Coffee Break Dia 1",
    "date_time": "2026-08-10T14:00:00Z"
  }
}
```

### Body - Combo

```json
{
  "type": "COMBO",
  "is_selling": true,
  "price": 59.90,
  "items": [1, 2]
}
```

Resposta de sucesso (`201`):

```json
{
  "message": "Produto criado com sucesso!",
  "product": {
    "id": 1,
    "type": "KIT",
    "is_selling": true,
    "price": 49.90,
    "kit": {
      "id": 1,
      "name": "Kit Semcomp 29",
      "size": "M",
      "color": "Preto",
      "is_babydoll": false
    }
  }
}
```

Erros comuns:

- `400`: `{"message":"Dados da requisição inválidos"}`
- `400`: `{"message":"Dados do kit são obrigatórios para produtos do tipo KIT"}`
- `400`: `{"message":"Um combo não pode conter outro combo como item: ID X"}`
- `500`: `{"message":"Erro ao criar produto"}`

---

## 2) Listar produtos [ADMIN]

- **Método**: `GET`
- **Rota**: `/admin/products`
- **Query params**:
  - `page` (opcional, default `1`, mínimo `1`)
  - `limit` (opcional, default `10`, mínimo `1`)
  - `sort_by` (opcional, default `id`)
  - `sort_order` (opcional, default `asc`)
  - `search_by` (opcional, usado com `search_value`)
  - `search_value` (opcional, usado com `search_by`)

### Campos permitidos em `sort_by`

- `id`
- `type`
- `is_selling`
- `price`

### Valores permitidos em `sort_order`

- `asc`
- `desc`

### Busca (`search_by` + `search_value`)

Campos permitidos em `search_by`:

- `type`
- `is_selling`
- `price`

Exemplo:

`GET /admin/products?page=1&limit=10&sort_by=price&sort_order=desc&search_by=type&search_value=KIT`

Resposta de sucesso (`200`):

```json
{
  "page": 1,
  "limit": 10,
  "sort_by": "price",
  "sort_order": "desc",
  "search_by": "type",
  "search_value": "KIT",
  "total_records": 5,
  "filtered_records": 2,
  "products": [...]
}
```

---

## 3) Buscar produto específico [ADMIN]

- **Método**: `GET`
- **Rota**: `/admin/products/:id`

Exemplo:

`GET /admin/products/1`

Resposta de sucesso (`200`):

```json
{
  "id": 1,
  "type": "KIT",
  "is_selling": true,
  "price": 49.90,
  "kit": {
    "id": 1,
    "name": "Kit Semcomp 29",
    "size": "M",
    "color": "Preto",
    "is_babydoll": false
  }
}
```

Erros comuns:

- `400`: `{"message":"ID do produto inválido"}`
- `404`: `{"message":"Produto não encontrado"}`

---

## 4) Atualizar produto [ADMIN]

- **Método**: `PUT`
- **Rota**: `/admin/products/:id`
- **Body (JSON)**: mesmo formato da criação

Exemplo:

`PUT /admin/products/1`

Resposta de sucesso (`200`):

```json
{
  "message": "Produto atualizado com sucesso!",
  "product": { ... }
}
```

Erros comuns:

- `400`: `{"message":"Dados da requisição inválidos"}`
- `404`: `{"message":"Produto não encontrado"}`
- `500`: `{"message":"Erro ao atualizar produto"}`

---

## 5) Deletar produto [ADMIN]

- **Método**: `DELETE`
- **Rota**: `/admin/products/:id`

Exemplo:

`DELETE /admin/products/1`

Resposta de sucesso (`200`):

```json
{
  "message": "Produto removido com sucesso!"
}
```

Erros comuns:

- `400`: `{"message":"ID do produto inválido"}`
- `404`: `{"message":"Produto não encontrado"}`
- `409`: `{"message":"Produto não pode ser removido pois é item de um ou mais combos"}`

---

## Observações

- As rotas em `/admin/...` estão agrupadas como admin no router e exigem Token Backoffice.
- O campo `id` é o identificador único do produto (auto-increment).
- O campo `type` determina qual especialização (kit/coffee) ou composição (combo) será utilizada.
- Combos não podem conter outros combos como itens.
- Produtos referenciados como itens de combos não podem ser deletados.
