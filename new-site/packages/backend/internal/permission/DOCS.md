# Documentação de API — Módulo: Permissions

> **Base path:** `/admin`  
> Todas as rotas são protegidas e requerem autenticação no backoffice.

---

## Índice

- [Visão Geral](#visão-geral)
- [Modelo de Dados](#modelo-de-dados)
- [Rotas](#rotas)
  - [POST /permissions](#post-permissions)
  - [GET /permissions](#get-permissions)
  - [GET /permissions/user/:user](#get-permissionsuseruser)
  - [GET /permissions/section/:section](#get-permissionssectionsection)
  - [PUT /permissions/:user/:section](#put-permissionsusersection)
  - [DELETE /permissions/:user/:section](#delete-permissionsusersection)
- [Erros Comuns](#erros-comuns)

---

## Visão Geral

O módulo de **Permissions** gerencia as permissões de acesso dos usuários do backoffice às seções do sistema. Cada permissão associa um usuário a uma seção com um tipo de acesso (`R` para leitura ou `RW` para leitura e escrita).

---

## Modelo de Dados

### Permission

| Campo            | Tipo   | Descrição                                      |
|------------------|--------|------------------------------------------------|
| `user_email`     | string | E-mail do usuário (chave primária composta)    |
| `section_name`   | string | Nome da seção (chave primária composta)        |
| `permission_type`| string | Tipo de permissão: `"R"` (leitura) ou `"RW"` (leitura e escrita) |

### PermissionRequest (Body)

| Campo            | Tipo   | Obrigatório | Restrições       |
|------------------|--------|-------------|------------------|
| `user_email`     | string | Sim         | Máx. 150 chars   |
| `section_name`   | string | Sim         | Máx. 200 chars   |
| `permission_type`| string | Sim         | `"R"` ou `"RW"` |

---

## Rotas

### POST /permissions

Cria uma nova permissão vinculando um usuário a uma seção.

**Validações realizadas:**
- A seção informada em `section_name` deve existir.
- O usuário informado em `user_email` deve existir no backoffice.
- O `permission_type` deve ser `"R"` ou `"RW"`.

#### Request Body

```json
{
  "user_email": "usuario@empresa.com",
  "section_name": "financeiro",
  "permission_type": "RW"
}
```

#### Respostas

| Status | Descrição |
|--------|-----------|
| `201 Created` | Permissão criada com sucesso |
| `400 Bad Request` | Dados inválidos, seção inexistente, usuário inexistente ou tipo de permissão inválido |
| `500 Internal Server Error` | Erro interno ao persistir a permissão |

#### Exemplo de resposta — 201

```json
{
  "message": "Permissão criada com sucesso!",
  "permission": {
    "user_email": "usuario@empresa.com",
    "section_name": "financeiro",
    "permission_type": "RW"
  }
}
```

---

### GET /permissions

Lista todas as permissões com suporte a paginação, ordenação e busca.

#### Query Parameters

| Parâmetro      | Tipo   | Padrão       | Descrição |
|----------------|--------|--------------|-----------|
| `page`         | int    | `1`          | Número da página (mínimo: 1) |
| `limit`        | int    | `10`         | Quantidade de itens por página (mínimo: 1) |
| `sort_by`      | string | `user_email` | Campo de ordenação: `user_email`, `section_name` ou `permission_type` |
| `sort_order`   | string | `asc`        | Direção da ordenação: `asc` ou `desc` |
| `search_by`    | string | —            | Campo de busca: `user_email`, `section_name` ou `permission_type` |
| `search_value` | string | —            | Valor a buscar (busca parcial, case-insensitive) |

> `search_by` e `search_value` devem ser fornecidos juntos ou omitidos juntos.

#### Respostas

| Status | Descrição |
|--------|-----------|
| `200 OK` | Lista retornada com sucesso |
| `400 Bad Request` | Parâmetros `page`, `limit`, `sort_by`, `sort_order`, `search_by` ou `search_value` inválidos |

#### Exemplo de resposta — 200

```json
{
  "Permissions": [...],
  "TotalRecords": 42,
  "FilteredRecords": 10
}
```

---

### GET /permissions/user/:user

Retorna todas as permissões associadas a um usuário específico.

#### Parâmetros de Rota

| Parâmetro | Tipo   | Descrição                        |
|-----------|--------|----------------------------------|
| `user`    | string | E-mail do usuário do backoffice  |

#### Respostas

| Status | Descrição |
|--------|-----------|
| `200 OK` | Permissões encontradas com sucesso |
| `400 Bad Request` | Usuário não encontrado no backoffice |
| `404 Not Found` | Nenhuma permissão encontrada para o usuário |
| `500 Internal Server Error` | Erro interno ao consultar as permissões |

#### Exemplo de resposta — 200

```json
[
  {
    "user_email": "usuario@empresa.com",
    "section_name": "financeiro",
    "permission_type": "R"
  },
  {
    "user_email": "usuario@empresa.com",
    "section_name": "relatorios",
    "permission_type": "RW"
  }
]
```

---

### GET /permissions/section/:section

Retorna todas as permissões associadas a uma seção específica.

#### Parâmetros de Rota

| Parâmetro | Tipo   | Descrição          |
|-----------|--------|--------------------|
| `section` | string | Nome da seção      |

#### Respostas

| Status | Descrição |
|--------|-----------|
| `200 OK` | Permissões encontradas com sucesso |
| `400 Bad Request` | Seção não encontrada |
| `404 Not Found` | Nenhuma permissão encontrada para a seção |
| `500 Internal Server Error` | Erro interno ao consultar as permissões |

#### Exemplo de resposta — 200

```json
[
  {
    "user_email": "alice@empresa.com",
    "section_name": "financeiro",
    "permission_type": "RW"
  },
  {
    "user_email": "bob@empresa.com",
    "section_name": "financeiro",
    "permission_type": "R"
  }
]
```

---

### PUT /permissions/:user/:section

Atualiza a permissão de um usuário em uma seção específica. Os parâmetros de rota identificam o registro existente; o body define os novos valores.

#### Parâmetros de Rota

| Parâmetro | Tipo   | Descrição                        |
|-----------|--------|----------------------------------|
| `user`    | string | E-mail do usuário atual          |
| `section` | string | Nome da seção atual              |

#### Request Body

```json
{
  "user_email": "usuario@empresa.com",
  "section_name": "financeiro",
  "permission_type": "R"
}
```

**Validações realizadas:**
- A seção informada em `section_name` deve existir.
- O usuário informado em `user_email` deve existir no backoffice.
- O `permission_type` deve ser `"R"` ou `"RW"`.

#### Respostas

| Status | Descrição |
|--------|-----------|
| `200 OK` | Permissão atualizada com sucesso |
| `400 Bad Request` | Dados inválidos, seção inexistente, usuário inexistente ou tipo de permissão inválido |
| `404 Not Found` | Permissão não encontrada para o par usuário/seção informado |
| `500 Internal Server Error` | Erro interno ao atualizar a permissão |

#### Exemplo de resposta — 200

```json
{
  "message": "Permissão atualizada com sucesso!"
}
```

---

### DELETE /permissions/:user/:section

Remove a permissão de um usuário em uma seção específica.

#### Parâmetros de Rota

| Parâmetro | Tipo   | Descrição                        |
|-----------|--------|----------------------------------|
| `user`    | string | E-mail do usuário                |
| `section` | string | Nome da seção                    |

#### Respostas

| Status | Descrição |
|--------|-----------|
| `200 OK` | Permissão removida com sucesso |
| `404 Not Found` | Nenhuma permissão encontrada para o par usuário/seção |
| `500 Internal Server Error` | Erro interno ao remover a permissão |

#### Exemplo de resposta — 200

```json
{
  "message": "Permissão removida com sucesso!"
}
```

---

## Erros Comuns

| Cenário | Status | Mensagem |
|---------|--------|----------|
| JSON malformado ou campos faltando | `400` | `"Dados inválidos"` |
| Seção não encontrada | `400` | `"Seção inexistente"` |
| Usuário não encontrado no backoffice | `400` | `"Usuário do Backoffice inexistente"` |
| `permission_type` diferente de `"R"` ou `"RW"` | `400` | `"Valor de Permissão inválido"` |
| `page` ou `limit` com valor menor que 1 | `400` | `"Parâmetro 'page' inválido"` / `"Parâmetro 'limit' inválido"` |
| `sort_by` ou `sort_order` inválidos | `400` | `"invalid sort_by parameter"` / `"invalid sort_order parameter"` |
| `search_by` sem `search_value` ou vice-versa | `400` | `"search_by and search_value must be provided together"` |
| Registro não encontrado na operação | `404` | Mensagem específica por rota |
| Falha no banco de dados | `500` | `"Erro interno do servidor"` |