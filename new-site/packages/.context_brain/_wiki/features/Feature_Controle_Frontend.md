---
type: feature-flow
tags: [feature, rbac, permissions, frontend, backoffice, guards, react]
---
# Feature: Controle de Acesso — Frontend

Guards de rota, filtragem de UI e gestão de permissões no backoffice.  
→ Middleware backend correspondente: [[Feature_Controle_Backend]]  
→ Contextos usados: [[Backoffice_Contextos_e_Lib]]

---

## 1. Guard de Rota (`RequirePermission`)
Arquivo: `src/lib/RequirePermission.tsx` — Outlet do React Router

```tsx
<RequirePermission section="Eventos" />
```

Internamente chama `useHasPermission(section, "R")`:
- `true` → renderiza `<Outlet />` (conteúdo da rota)
- `false` → redireciona para `/home`

Para rotas de escrita, o `RequirePermission` com `"RW"` protege o acesso completo à página.

---

## 2. Filtragem de Cards na Home

```ts
const visibleTabs = Tabs.filter(tab =>
  permissions.some(p => p.section_name === tab.section)
);
```

Admin sem permissão em uma seção não vê o card dessa seção na Home.

---

## 3. CrudTable — Modo Leitura

Prop `canWrite={useHasPermission("<seção>", "RW")}`:
- `true` → exibe botões de criar, editar, deletar
- `false` → oculta todos os controles de escrita (visualização apenas)

---

## 4. Página de Edição de Permissões (`/permissions`)

Abordagem **matrix** (usuários × seções):
- Linhas = usuários backoffice (via `GET /admin/usersBackoffice?limit=1000`)
- Colunas = 5 seções com tab (nota: `"Produtos"` não aparece na UI)
- Células = badge `RW` (verde) / `R` (azul) / `—` (cinza)
- Modal de edição por usuário com `<Select>` por seção

**Diff ao salvar:**
| Mudança | Chamada API |
|---|---|
| `—` → `R` ou `RW` | `POST /admin/permissions` |
| `R` → `RW` ou `RW` → `R` | `PUT /admin/permissions/:user/:section` |
| `R` ou `RW` → `—` | `DELETE /admin/permissions/:user/:section` |

> ⚠️ **Limitação**: `Promise.all` paralelo sem rollback — falha parcial deixa estado inconsistente.

---

## 5. Refresh Automático de Permissões Próprias

```ts
if (editTarget.email === user?.email) await refreshPermissions();
```

`refreshPermissions()` → `GET /admin/permissions/me` — email lido do JWT no backend.  
Garante que o admin que editou suas próprias permissões vê o estado atualizado imediatamente.

---

## 6. Permissões Retornadas no Login

`POST /admin/login` retorna `permissions[]` junto com o token.  
Front armazena em state + `localStorage["semcomp-backoffice-permissions"]`.  
Em cada mount do `AuthProvider`, as permissões são lidas do localStorage.

---

## Referências
- Backend: [[Feature_Controle_Backend]]
- Endpoints: [[Integracao_API_Backoffice]]
- Tabs sync: [[Backoffice_Contextos_e_Lib]]
