---
type: feature-flow
tags: [feature, papfe, documento, upload, aprovacao, backoffice]
---
# Feature: PAPFE (Comprovante de Participação)

Participantes podem enviar comprovante PAPFE no cadastro; equipe backoffice revisa e aprova/rejeita.

---

## Entidade
→ [[Backend_Modelos_Core#PapfeDocument]]

Tabela: `papfe_documents` | arquivo em disco: `uploads/papfe/`  
`IsApproved *bool` — tri-state: `nil` = pendente, `true` = aprovado, `false` = rejeitado

---

## Fluxo — Cadastro (Site)

Rota: `POST /register` (multipart form-data)

1. Participante preenche cadastro + anexa comprovante PAPFE
2. Handler lê arquivo via `r.FormFile("papfe_document")`
3. Verifica tipo MIME via magic bytes (não content-type header)
4. Salva arquivo em `uploads/papfe/<filename>`
5. Cria `PapfeDocument` com `IsApproved = nil` (pendente)
6. Seta `User.HasPapfe = true`

Atualização posterior: `PUT /api/papfe-document` — participante pode reenviar comprovante (requer `AuthMiddleware`)

---

## Fluxo — Revisão Backoffice

Página: `front-backoffice/src/pages/PapfeDocuments/index.tsx`  
Seção: `"PAPFE"` | `canWrite = useHasPermission("PAPFE", "RW")`

1. `papfeAPI.getAll()` → `GET /admin/papfe-documents` — lista documentos com `PapfeDocumentInfo`
2. Cada linha exibe: Participante, Data de envio, Status (badge colorido)
3. Botão "Visualizar" → `GET /admin/users/:id/papfe-document` → abre arquivo em Dialog
4. Botão Aprovar/Rejeitar → `PUT /admin/users/:id/papfe-document/approval` com `{ approved: bool }`

`papfeAPI` é importado diretamente de `front-backoffice/src/api/users.ts` (não está no barrel).

---

## PapfeDocumentInfo (shape da listagem)

```ts
{
  id: uint
  user_number: uint
  user_name: string
  user_email: string
  filename: string
  content_type: string
  uploaded_at: Time
  is_approved: *bool  // null=pendente, true=aprovado, false=rejeitado
}
```

---

## Endpoints

| Método | Path | Guard | Notas |
|---|---|---|---|
| PUT | `/api/papfe-document` | AuthMiddleware | upload/reenvio pelo participante |
| GET | `/admin/papfe-documents` | PermR `"PAPFE"` | lista todos os documentos |
| GET | `/admin/users/:id/papfe-document` | PermR `"PAPFE"` | baixa arquivo do participante |
| PUT | `/admin/users/:id/papfe-document/approval` | PermRW `"PAPFE"` | aprova ou rejeita |

→ [[Integracao_API_Backoffice#PAPFE]]
