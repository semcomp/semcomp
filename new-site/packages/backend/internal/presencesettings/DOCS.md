# Presence Settings API

Documentação das rotas de configuração de pesos de presença por tipo de evento.

## Conceito

A porcentagem de presença de cada usuário (`users.presence_rate`, escala 0–100) é
calculada automaticamente pelo backend:

- **Tipos contáveis**: apenas tipos cadastrados nesta configuração (ex.: `Palestra`,
  `Vitrine`) E com `has_attendance = true`.
- **Denominador**: soma dos pesos de todos os eventos contáveis.
- **Crédito do usuário** (união, sem duplicar):
  - presença direta em um evento contável credita o peso dele;
  - presença em qualquer evento concomitante (interseção parcial de horário) a um
    evento contável credita o peso deste (ex.: participante de minicurso ganha a
    palestra e a vitrine que ocorrem durante ele);
  - evento sem nenhum contável concomitante não vale presença.
- **Taxa** = crédito ÷ denominador × 100 (2 casas decimais).

O matching do tipo é case-insensitive e ignora espaços nas bordas.

## Recálculo automático

Disparado em:

- criação/atualização/remoção de presença (QR reader e CRUD Participações) — só o usuário afetado;
- criação/atualização/remoção de evento — global;
- criação/atualização/remoção de peso (estas rotas) — global;
- inicialização da API.

Não existe endpoint manual de recálculo.

---

## 1) Listar pesos [ADMIN]

- **Metodo**: `GET`
- **Rota**: `/admin/presence-settings`
- **Permissão**: `Configurações Presença` (R)

Resposta de sucesso (`200`):

```json
{
  "weights": [
    { "id": 1, "type_name": "Palestra", "weight": 1, "updated_at": "2026-08-24T12:00:00Z" },
    { "id": 2, "type_name": "Vitrine", "weight": 0.5, "updated_at": "2026-08-24T12:00:00Z" }
  ]
}
```

---

## 2) Criar peso [ADMIN]

- **Metodo**: `POST`
- **Rota**: `/admin/presence-settings`
- **Permissão**: `Configurações Presença` (RW)
- **Body (JSON)**:

```json
{ "type_name": "Minicurso", "weight": 1 }
```

Resposta de sucesso (`201`):

```json
{
  "message": "Peso de presença criado com sucesso!",
  "weight": { "id": 3, "type_name": "Minicurso", "weight": 1 }
}
```

Erros comuns:

- `400`: `{"error":"Dados inválidos"}`
- `409`: `{"error":"Já existe um peso cadastrado para este tipo de evento"}`

---

## 3) Atualizar peso [ADMIN]

- **Metodo**: `PUT`
- **Rota**: `/admin/presence-settings/:typeName`
- **Permissão**: `Configurações Presença` (RW)
- Permite renomear o tipo e/ou alterar o peso.
- **Body (JSON)**:

```json
{ "type_name": "Vitrine", "weight": 0.75 }
```

Exemplo:

`PUT /admin/presence-settings/Vitrine`

Resposta de sucesso (`200`):

```json
{
  "message": "Peso de presença atualizado com sucesso!",
  "weight": { "id": 2, "type_name": "Vitrine", "weight": 0.75 }
}
```

Erros comuns:

- `404`: `{"error":"Peso de presença não encontrado"}`
- `409`: `{"error":"Já existe um peso cadastrado para este tipo de evento"}`

---

## 4) Remover peso [ADMIN]

- **Metodo**: `DELETE`
- **Rota**: `/admin/presence-settings/:typeName`
- **Permissão**: `Configurações Presença` (RW)

Exemplo:

`DELETE /admin/presence-settings/Vitrine`

Resposta de sucesso (`200`):

```json
{ "message": "Peso de presença removido com sucesso!" }
```

Após a remoção, eventos desse tipo deixam de ser contáveis (valem 0 e saem do denominador).

Erros comuns:

- `404`: `{"error":"Peso de presença não encontrado"}`

---

## Observações

- Pesos padrão semeados em banco vazio: `Palestra = 1.0`, `Vitrine = 0.5`.
- As rotas exigem autenticação do backoffice (Bearer token).
