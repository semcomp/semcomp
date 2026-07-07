---
type: feature-flow
tags: [feature, rbac, permissions, backoffice, acesso, mock]
---
# Funcionalidade: Controle de Acesso e Permissões

RBAC simples por seção. Admins (`UserBackoffice`) recebem `"R"` ou `"RW"` por `Section`.

---

## Modelo de Permissão

Struct: [[Backend_Models#Permission]]  
Chave composta: `UserEmail (FK → users_backoffice) + SectionName (string — sem FK)`

| Campo | Valores | Semântica |
|---|---|---|
| `PermissionType` | `"R"` | leitura somente |
| `PermissionType` | `"RW"` | leitura e escrita |

### 6 Seções Padrão (definidas em código)
Definidas em `permission/model.go → KnownSections`:

| Seção | Tab no front |
|---|---|
| `"Seções"` | *(tab removida)* |
| `"Eventos"` | `/events` |
| `"Usuários Backoffice"` | `/backoffice-users` |
| `"Usuários Semcomp"` | `/semcomp-users` |
| `"Participações"` | `/participation` |
| `"Permissões"` | `/permissions` |

> Seções deixaram de ser uma entidade do banco de dados. A lista `KnownSections` no pacote `permission` é a única fonte da verdade — igual ao padrão `KnownResources` do projeto USP_WEB.

Admin padrão (via `ADMIN_EMAIL` env) recebe `"RW"` em todas as 6 via `InitializePermissions()` na startup.

---

## Validações no Handler Go

Arquivo: `internal/permission/handler.go`  
Antes de `CreatePermission` e `UpdatePermissionByUserSection`, o handler valida:

1. `slices.Contains(KnownSections, request.SectionName)` → 400 se seção não está na lista de código
2. `userBackofficeService.GetUserByEmail(request.UserEmail)` → 400 se admin inexistente
3. `request.PermissionType ∈ {"R", "RW"}` → 400 se valor inválido

Essas validações **não estão na struct de request** — ocorrem no handler, não no middleware de binding.  
`sectionService` foi removido de `PermissionHandler` — não há mais dependência do módulo `section`.

---

## Retorno no Login

`POST /admin/login` retorna `permissions[]` junto com o token:
```json
{
  "message": "Login realizado",
  "user": { "email": "..." },
  "permissions": [{ "user_email": "...", "section_name": "...", "permission_type": "RW" }],
  "token": "..."
}
```
→ Detalhes em [[Integracao_API#POST_admin_login]]  
→ Lógica de ausência: [[Feature_Autenticacao_e_Sessoes#Fluxo_Backoffice]]

---

## Estado de Integração no Frontend

⚠️ **Página `/permissions` usa mock** — não há integração com o backend.

| Item | Estado |
|---|---|
| `front-backoffice/src/pages/Permission/index.tsx` | usa `samplePermissions` (mock local) |
| `src/api/index.ts` | **sem** export `permissionsAPI` |
| Backend endpoints | ✅ todos implementados e funcionais |

Impacto: qualquer alteração de permissão feita via UI é **local e volátil** — não persiste no banco.

### Endpoints backend disponíveis (sem front integrado)
Ver [[Integracao_API#Permissions_Backoffice]] para tabela completa.

---

## Referências
- Entidade: [[Backend_Models#Permission]], [[Backend_Models#Section]], [[Backend_Models#UserBackoffice]]
- Módulo backend: [[Backend_Arquitetura#permission]]
- Navegação: [[Backoffice_Contextos_e_Lib#Tabs]] (`key: "permissions"`, ícone `Key`)
- Fluxo de login com permissions: [[Feature_Autenticacao_e_Sessoes#Fluxo_Backoffice]]
