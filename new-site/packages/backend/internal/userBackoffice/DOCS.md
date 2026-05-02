# User Backoffice API

Documentacao das rotas de gerenciamento de usuarios do backoffice.

## Entidade UserBackoffice

A tabela de usuarios do backoffice é composta por:

- `Email`: E-mail do usuario (identificador unico).
- `Password`: Senha do usuario (minimo 8 caracteres, armazenada como hash).

---

## 1) Login

- **Metodo**: `POST`
- **Rota**: `/admin/login`
- **Body (JSON)**:

```json
{
  "email": "sitesemcomp@gmail.com",
  "password": "senhaBoa"
}
```

Resposta de sucesso (`200`):

```json
{
	"message": "Login successful",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNpdGVzZW1jb21wQGdtYWlsLmNvbSIsImV4cCI6MTc3Nzg0NDkyNiwiaWF0IjoxNzc3NzU4NTI2LCJzdWIiOiJzaXRlc2VtY29tcEBnbWFpbC5jb20ifQ.zUSbjw0kmHYxaDdMa3nkMm3NbUn6I6dClRYlpuyukmc",
	"user": {
		"email": "sitesemcomp@gmail.com"
	}
}
```

## 1) Criar usuario [ADMIN]

- **Metodo**: `POST`
- **Rota**: `/admin/usersBackoffice`
- **Body (JSON)**:

```json
{
  "email": "usuario@exemplo.com",
  "password": "senhasegura123"
}
```

Resposta de sucesso (`201`):

```json
{
  "message": "Usuário criado com sucesso!",
  "user": {
    "email": "usuario@exemplo.com"
  }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}`
- `500`: `{"error":"e-mail já cadastrado"}`
- `500`: `{"error":"..."}`

---

## 2) Listar usuarios [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/usersBackoffice`
- **Query params**:
  - `page` (opcional, default `1`, minimo `1`)
  - `limit` (opcional, default `10`, minimo `1`)
  - `sort_by` (opcional, default `email`)
  - `sort_order` (opcional, default `asc`)
  - `search_by` (opcional, usado com `search_value`)
  - `search_value` (opcional, usado com `search_by`)

### Campos permitidos em `sort_by`

- `email`

### Valores permitidos em `sort_order`

- `asc`
- `desc`

### Busca (`search_by` + `search_value`)

Deve ser usado **um campo por vez**.

Campos permitidos em `search_by`:

- `email`

Exemplo:

`GET /admin/usersBackoffice?page=1&limit=10&sort_by=email&sort_order=asc&search_by=email&search_value=exemplo`

Resposta de sucesso (`200`):

```json
{
  "page": 1,
  "limit": 10,
  "sort_by": "email",
  "sort_order": "asc",
  "search_by": "email",
  "search_value": "exemplo",
  "total_records": 5,
  "filtered_records": 1,
  "usersBackoffice": [
    {
      "email": "usuario@exemplo.com"
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

## 3) Buscar usuario especifico [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/usersBackoffice/:email`

Exemplo:

`GET /admin/usersBackoffice/usuario@exemplo.com`

Resposta de sucesso (`200`):

```json
{
  "email": "usuario@exemplo.com"
}
```

Erros comuns:

- `404`: `{"error":"Usuário não encontrado"}`

---

## 4) Atualizar usuario [ADMIN]

- **Metodo**: `PUT`
- **Rota**: `/admin/usersBackoffice/:email`
- **Body (JSON)**:

```json
{
  "email": "novoemail@exemplo.com",
  "password": "novasenha123"
}
```

> O campo `password` é opcional na atualizacao. Se omitido, a senha nao sera alterada.

Exemplo:

`PUT /admin/usersBackoffice/usuario@exemplo.com`

Resposta de sucesso (`200`):

```json
{
  "message": "Usuário atualizado com sucesso!"
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}`
- `500`: `{"error":"..."}`

---

## 5) Deletar usuario [ADMIN]

- **Metodo**: `DELETE`
- **Rota**: `/admin/usersBackoffice/:email`

Exemplo:

`DELETE /admin/usersBackoffice/usuario@exemplo.com`

Resposta de sucesso (`200`):

```json
{
  "message": "Usuário removido com sucesso!"
}
```

Erros comuns:

- `500`: `{"error":"Usuário a ser deletado não existe"}`
- `500`: `{"error":"..."}`

---

## Observacoes

- As rotas em `/admin/...` estao agrupadas como admin no router e exigem Token Backoffice.
- O campo `email` é o identificador unico do usuario e é usado como parametro de URL nas rotas de busca, atualizacao e remocao.
- O campo `password` nunca é retornado nas respostas; apenas o `email` é exposto via `SafeUserB`.
- A inicializacao do admin é feita automaticamente via variaveis de ambiente `ADMIN_EMAIL` e `ADMIN_PASSWORD` na inicializacao do sistema.