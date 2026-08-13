# Absence Justification API

Documentação das rotas de justificativa de ausência do backend.

## Entidade AbsenceJustification

- `id`: identificador da justificativa.
- `user_email`: e-mail do participante que enviou a justificativa (único — cada participante tem no máximo uma justificativa).
- `event_name` / `event_init_date`: sempre `"SEMCOMP"` / data de envio — a justificativa é referente ao evento como um todo, não a uma sessão/palestra específica.
- `reason`: motivo descrito pelo participante.
- `attachment_filename` / `attachment_content_type`: metadados do anexo comprobatório; o arquivo em si fica em disco (`uploads/absence-justifications/`).
- `submitted_at`: data de envio.
- `status`: `em_analise` (padrão), `aprovado` ou `negado`.

---

## 1) Enviar justificativa [PARTICIPANTE AUTENTICADO]

- **Método**: `POST`
- **Rota**: `/api/absence-justifications`
- **Body**: `multipart/form-data`
  - `reason` (string, obrigatório, máx. 2000 caracteres)
  - `attachment` (arquivo, obrigatório: PDF/JPEG/PNG/WebP, máx. 10MB)

O e-mail do participante é lido do JWT (`AuthMiddleware`).

Resposta de sucesso (`201`):

```json
{
  "message": "Justificativa de ausência enviada com sucesso!",
  "absence_justification": {
    "id": 1,
    "user_number": 12345,
    "user_name": "Fulano de Ciclano",
    "user_email": "participante@example.com",
    "event_name": "SEMCOMP",
    "event_init_date": "2026-08-12T20:46:02Z",
    "reason": "Consulta médica",
    "attachment_filename": "comprovante.pdf",
    "attachment_content_type": "application/pdf",
    "submitted_at": "2026-08-12T20:46:02Z",
    "status": "em_analise"
  }
}
```

Erros comuns:

- `400`: `{"message":"O anexo comprobatório é obrigatório"}`, `{"message":"Tipo de arquivo não permitido..."}`
- `409`: `{"message":"Você já enviou uma justificativa de ausência"}` — use `PATCH` para editar.

---

## 2) Consultar a própria justificativa [PARTICIPANTE AUTENTICADO]

- **Método**: `GET`
- **Rota**: `/api/absence-justifications/mine`

Resposta de sucesso (`200`): mesmo formato do item 1 (`{"absence_justification": {...}}`).

Erros comuns:

- `404`: `{"message":"Justificativa de ausência não encontrada"}` — o participante ainda não enviou nenhuma.

---

## 3) Editar a própria justificativa [PARTICIPANTE AUTENTICADO]

- **Método**: `PATCH`
- **Rota**: `/api/absence-justifications/:id`
- **Body**: `multipart/form-data`
  - `reason` (string, obrigatório)
  - `attachment` (arquivo, opcional — se enviado, substitui o anterior)

Permitido em qualquer status **exceto** `aprovado`. Editar uma justificativa `negado` a reenvia automaticamente para `em_analise`.

Erros comuns:

- `403`: `{"message":"Você não tem permissão para editar esta justificativa"}` (não é o dono)
- `409`: `{"message":"Não é possível editar uma justificativa já aprovada"}`

---

## 4) Obter o próprio anexo [PARTICIPANTE AUTENTICADO]

- **Método**: `GET`
- **Rota**: `/api/absence-justifications/:id/attachment`

Retorna o arquivo (`Content-Disposition: inline`). `403` se a justificativa não pertencer ao usuário autenticado.

---

## 5) Listar justificativas [ADMIN]

- **Método**: `GET`
- **Rota**: `/admin/absence-justifications`
- **Permissão**: `Justificativas de Ausência` (R)

Resposta de sucesso (`200`): `{"absence_justifications": [...]}` — mesmo formato do item 1, em lista.

---

## 6) Obter anexo de qualquer justificativa [ADMIN]

- **Método**: `GET`
- **Rota**: `/admin/absence-justifications/:id/attachment`
- **Permissão**: `Justificativas de Ausência` (R)

---

## 7) Atualizar status [ADMIN]

- **Método**: `PATCH`
- **Rota**: `/admin/absence-justifications/:id`
- **Permissão**: `Justificativas de Ausência` (RW)
- **Body (JSON)**: `{"status": "aprovado"}` — `em_analise`, `aprovado` ou `negado`.

Resposta de sucesso (`200`): `{"message": "..."}`.

---

## Observações

- As rotas em `/admin/...` exigem `AuthBackofficeMiddleware` + permissão `Justificativas de Ausência`.
- As rotas em `/api/absence-justifications*` exigem `AuthMiddleware` (participante autenticado no site).
- O corpo de erro segue o padrão de `apierrors.APIError`: `{"code": "...", "message": "..."}` — **não** `{"error": "..."}`.
