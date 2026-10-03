---
type: feature-flow
tags: [feature, rbac, permissions, backend, middleware, golang]
---
# Feature: Controle de Acesso — Backend

RBAC simples por seção. Proteção no middleware Go antes do handler chegar ao domínio.  
→ Guards no frontend: [[Feature_Controle_Frontend]]  
→ Modelo Permission: [[Backend_Modelos_Core]] (Section) + structs em [[_raw/Backend_Models]]

---

## KnownSections (10 seções)
Definidas em `internal/permission/model.go`.  
**O campo `section` em `Tabs.tsx` deve estar em sync com esta lista.**

| Seção | Tab no backoffice | Rota front | Há UI de gestão |
|---|---|---|---|
| `"Eventos"` | ✅ | `/events` | ✅ |
| `"Usuários Backoffice"` | ✅ | `/backoffice-users` | ✅ |
| `"Usuários Semcomp"` | ✅ | `/semcomp-users` | ✅ |
| `"Participações"` | ✅ | `/participation` | ✅ |
| `"Permissões"` | ✅ | `/permissions` | ✅ |
| `"Produtos"` | ❌ sem tab | — | ❌ (backend only) |
| `"Páginas"` | ✅ | `/pages-availability` | ✅ |
| `"Patrocinadores"` | ✅ | `/sponsors` | ✅ → [[Feature_Patrocinadores]] |
| `"PAPFE"` | ✅ | `/papfe-documents` | ✅ → [[Feature_PAPFE]] |
| `"Inscrições"` | ❌ sem tab | — | ❌ (CRUD admin via API, sem página no backoffice) |

**Inicialização:**
- `InitializeSections()` → cria as 7 seções na startup
- Admin padrão (`ADMIN_EMAIL`) recebe `"RW"` em todas via `InitializePermissions()`
- Novo admin criado: `SeedUserPermissions` é chamado → sem permissões (admin define depois)

---

## Modelo de Permissão

| Valor | Significado |
|---|---|
| `nil` / ausente | sem acesso |
| `"R"` | leitura |
| `"RW"` | leitura + escrita |

`HasLevel(actual, required)` — comparação ordinal: PermR=1, PermRW=2.  
`"R"` satisfaz requisito `"R"`; `"RW"` satisfaz `"R"` e `"RW"`.

---

## Middleware de Permissão
Arquivo: `internal/middleware/permission.go`

```go
RequirePermission(permSvc, section, required) gin.HandlerFunc
  → lê email do contexto Gin (injetado por AuthBackofficeMiddleware)
  → permSvc.CheckPermission(email, section, required)
  → 403 se insuficiente | 401 se email ausente no contexto
```

Registrado em `main.go` como `permMW(section, level)`.  
Aplicado em **todas as rotas admin exceto** `GET /admin/permissions/me`.

---

## Validações no Handler de Permissão

Antes de `Create`/`Update` de uma permissão:
1. `slices.Contains(KnownSections, request.SectionName)` → 400 se seção inválida
2. `userBackofficeService.GetUserByEmail(request.UserEmail)` → 400 se admin inexistente
3. `request.PermissionType ∈ {"R", "RW"}` → 400 se tipo inválido

---

## Endpoints Relacionados
→ [[Integracao_API_Backoffice#Permissões]]

| Método | Path | Guard |
|---|---|---|
| GET | `/admin/permissions/me` | apenas `AuthBackofficeMiddleware` |
| GET | `/admin/permissions` | PermR |
| POST | `/admin/permissions` | PermRW |
| PUT | `/admin/permissions/:user/:section` | PermRW |
| DELETE | `/admin/permissions/:user/:section` | PermRW |
