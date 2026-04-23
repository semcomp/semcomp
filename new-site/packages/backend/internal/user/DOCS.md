# API Documentation

Documentação das rotas disponíveis na API, com exemplos de requisições para facilitar testes manuais (curl, Postman, Insomnia, etc.).

---

## Autenticação

Algumas rotas exigem um token JWT no header `Authorization`. Após fazer login, use o token retornado assim:

```
Authorization: Bearer <seu_token_aqui>
```

---

## Rotas Públicas

### `POST /register` — Criar usuário

Cria um novo usuário no sistema.

**Request body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "minhasenha123"
}
```

**Exemplo com curl:**
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@example.com", "password": "minhasenha123"}'
```

**Resposta de sucesso (`201 Created`):**
```json
{
  "message": "Usuário criado com sucesso!",
  "user": {
    "user_number": "00001",
    "name": "João Silva",
    "email": "joao@example.com",
    "presence_rate": 0
  }
}
```

**Possíveis erros:**
- `400 Bad Request` — campos obrigatórios ausentes, e-mail inválido ou senha com menos de 8 caracteres
- `500 Internal Server Error` — e-mail já cadastrado ou erro interno

---

### `POST /login` — Autenticar usuário

Autentica o usuário e retorna um token JWT.

**Request body:**
```json
{
  "email": "joao@example.com",
  "password": "minhasenha123"
}
```

**Exemplo com curl:**
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@example.com", "password": "minhasenha123"}'
```

**Resposta de sucesso (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Rotas Protegidas

> Exigem o header `Authorization: Bearer <token>`.

### `GET /api/profile` — Perfil do usuário autenticado

Retorna os dados do usuário com base no token JWT fornecido.

**Exemplo com curl:**
```bash
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer <seu_token>"
```

**Resposta de sucesso (`200 OK`):**
```json
{
  "user_number": "00001",
  "name": "João Silva",
  "email": "joao@example.com",
  "presence_rate": 0
}
```

---

## Rotas Backoffice

> Rotas administrativas. Atualmente **não possuem middleware de autenticação** (ver TODO no código).

### `GET /admin/users` — Listar usuários

Retorna uma lista paginada de usuários, com suporte a ordenação e busca.

**Query parameters:**

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | int | `1` | Número da página |
| `limit` | int | `10` | Itens por página |
| `sort_by` | string | `name` | Campo de ordenação: `name`, `email`, `presence_rate`, `user_number` |
| `sort_order` | string | `asc` | Direção: `asc` ou `desc` |
| `search_by` | string | — | Campo de busca: `name`, `email`, `presence_rate`, `user_number` |
| `search_value` | string | — | Valor a buscar (deve ser usado junto com `search_by`) |

**Exemplo — listagem simples:**
```bash
curl "http://localhost:8080/admin/users?page=1&limit=10"
```

**Exemplo — com ordenação:**
```bash
curl "http://localhost:8080/admin/users?sort_by=name&sort_order=desc"
```

**Exemplo — com busca:**
```bash
curl "http://localhost:8080/admin/users?search_by=name&search_value=João"
```

**Resposta de sucesso (`200 OK`):**
```json
{
  "page": 1,
  "limit": 10,
  "sort_by": "name",
  "sort_order": "asc",
  "search_by": "name",
  "search_value": "João",
  "total_records": 50,
  "filtered_records": 3,
  "users": [
    {
      "user_number": "00001",
      "name": "João Silva",
      "email": "joao@example.com",
      "presence_rate": 0.85
    }
  ]
}
```

**Possíveis erros:**
- `400 Bad Request` — parâmetros inválidos (page/limit menor que 1, sort_by/search_by inválido, ou apenas um dos pares search_by/search_value fornecido)

---

### `GET /admin/users/:id` — Buscar usuário por ID

Retorna os dados de um usuário específico.

**Exemplo com curl:**
```bash
curl http://localhost:8080/admin/users/1
```

**Resposta de sucesso (`200 OK`):**
```json
{
  "user_number": "00001",
  "name": "João Silva",
  "email": "joao@example.com",
  "presence_rate": 0.85
}
```

**Possíveis erros:**
- `400 Bad Request` — ID não é um número válido
- `404 Not Found` — usuário não encontrado

---

### `PUT /admin/users/:id` — Atualizar usuário

Atualiza os dados de um usuário existente. Todos os campos são obrigatórios, exceto `password`.

**Request body:**
```json
{
  "name": "João Atualizado",
  "email": "joao.novo@example.com",
  "presence_rate": 0.9
}
```

Para atualizar a senha junto:
```json
{
  "name": "João Atualizado",
  "email": "joao.novo@example.com",
  "password": "novasenha456",
  "presence_rate": 0.9
}
```

**Exemplo com curl:**
```bash
curl -X PUT http://localhost:8080/admin/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "João Atualizado", "email": "joao.novo@example.com", "presence_rate": 0.9}'
```

**Resposta de sucesso (`200 OK`):**
```json
{
  "message": "Usuário atualizado com sucesso!"
}
```

**Possíveis erros:**
- `400 Bad Request` — ID inválido ou body malformado
- `404 Not Found` — usuário não encontrado (retornado como `500` atualmente)
- `500 Internal Server Error` — erro interno

---

### `DELETE /admin/users/:id` — Remover usuário

Remove um usuário do sistema pelo ID.

**Exemplo com curl:**
```bash
curl -X DELETE http://localhost:8080/admin/users/1
```

**Resposta de sucesso (`200 OK`):**
```json
{
  "message": "Usuário removido com sucesso!"
}
```

**Possíveis erros:**
- `400 Bad Request` — ID não é um número válido
- `500 Internal Server Error` — erro interno

---

## Observações

- O campo `password` deve ter no mínimo **8 caracteres**.
- Os campos `search_by` e `search_value` precisam ser fornecidos **juntos** — usar apenas um retorna erro.
- O campo `user_number` é exibido formatado com 5 dígitos (ex: `"00001"`).
- As buscas por texto usam `ILIKE` (case-insensitive) no banco de dados.