---
type: wiki-integration
tags: [api, integration, backoffice, admin, axios, rest, endpoints, rbac]
---
# Integração API — Backoffice ↔ Backend

Base URL dev: `http://localhost:4000` | prod: `https://semcomp.icmc.usp.br/api`  
Toggle: `front-backoffice/src/constants/ApiURL.tsx` → `VITE_DEBUG_MODE=true` para dev

---

## Cliente Axios (Backoffice)
Arquivo: `front-backoffice/src/api/client.ts`  
Storage key: `semcomp-backoffice-token`

- Request interceptor: injeta `Authorization: Bearer <token>`
- Response (401): remove token + `window.location.href = "/admin/login"` (redirect automático)
- Response (sucesso): normaliza token renovado (remove `"Bearer "` duplicado se presente)

---

## Admin Público

| Método | Path | Handler TS |
|---|---|---|
| POST | `/admin/login` | `authAPI.login(email, pw)` |

**Resposta**: `{ message, user: SafeUserB, permissions: BackofficePermission[], token }`

---

## Rotas Backoffice (`/admin`, guard: `AuthBackofficeMiddleware`)

Todas as rotas abaixo exigem autenticação. As que indicam `PermR`/`PermRW` exigem adicionalmente o guard de permissão por seção.

### Usuários Semcomp (`"Usuários Semcomp"`)
| Método | Path | Handler TS |
|---|---|---|
| GET | `/admin/users` | `userSemcompAPI.getAll(page, ...)` |
| GET | `/admin/users/:id` | `userSemcompAPI.getById(id)` |
| POST | `/admin/users` | `userSemcompAPI.create(data)` |
| PUT | `/admin/users/:id` | `userSemcompAPI.update(id, data)` |
| DELETE | `/admin/users/:id` | `userSemcompAPI.delete(id)` |

### Usuários Backoffice (`"Usuários Backoffice"`)
| Método | Path | Handler TS |
|---|---|---|
| GET | `/admin/usersBackoffice` | `userBackofficeAPI.getAll(page, ...)` |
| GET | `/admin/usersBackoffice/:email` | `userBackofficeAPI.getByEmail(email)` |
| POST | `/admin/usersBackoffice` | `userBackofficeAPI.create(data)` |
| PUT | `/admin/usersBackoffice/:email` | `userBackofficeAPI.update(email, data)` |
| DELETE | `/admin/usersBackoffice/:email` | `userBackofficeAPI.delete(email)` |

### Eventos (`"Eventos"`)
| Método | Path | Handler TS | Notas |
|---|---|---|---|
| POST | `/admin/events` | `eventsAPI.create(data)` | |
| PUT | `/admin/events/:name/:initDate` | `eventsAPI.update(name, date, data)` | |
| DELETE | `/admin/events/:name/:initDate` | `eventsAPI.delete(name, date)` | |

> GET de eventos é público via `/events` — sem rota `/admin/events` GET.

### Participações (`"Participações"`)
| Método | Path | Handler TS |
|---|---|---|
| POST | `/admin/presences` | `participationAPI.create` / `createByQRCode` |
| GET | `/admin/presences` | `participationAPI.getAll(page, ...)` |
| GET | `/admin/presences/:u/:e/:d` | `participationAPI.getByKeys` |
| PUT | `/admin/presences/:u/:e/:d` | `participationAPI.update(...)` |
| DELETE | `/admin/presences/:u/:e/:d` | `participationAPI.delete(u, e, d)` |

### Produtos (`"Produtos"`)
| Método | Path | Handler TS | Notas |
|---|---|---|---|
| GET | `/admin/products` | `productsAPI.getAll(page, ...)` | paginado |
| GET | `/admin/products/:id` | `productsAPI.getByID(id)` | |
| POST | `/admin/products` | `productsAPI.create(data)` / `bulkCreate` | |
| PUT | `/admin/products/:id` | `productsAPI.update(id, data)` | |
| DELETE | `/admin/products/:id` | `productsAPI.delete(id)` | bloqueado se for item de combo (409) |
| POST | `/admin/products` | `productsAPI.createCombo` / `updateCombo` | payload COMBO (`items: [{item_id, quantity}]`) |

> UI em `pages/Products` (`/products`).

### Vendas (`"Vendas"`)
| Método | Path | Handler TS | Notas |
|---|---|---|---|
| GET | `/admin/sales` | `salesAPI.getAll(page, ...)` | lista vendas |
| PUT | `/admin/sales/:id` | `salesAPI.update(id, payload)` | mudar status destrava/retrava consumido |
| DELETE | `/admin/sales/:id` | `salesAPI.delete(id)` | libera travas `consumed_items` |
| PATCH | `/admin/sales/items/:itemId/pickup` | `salesAPI.updateItemPickup(itemId, {is_picked_up})` | retirada de item |

> UI em `pages/Sales` (`/sales`).

### Permissões (`"Permissões"`)
| Método | Path | Guard extra | Handler TS |
|---|---|---|---|
| GET | `/admin/permissions/me` | nenhum | `permissionsAPI.getMe()` |
| GET | `/admin/permissions` | PermR | `permissionsAPI.getAll()` |
| GET | `/admin/permissions/section/:section` | PermR | — |
| POST | `/admin/permissions` | PermRW | `permissionsAPI.create(email, section, type)` |
| PUT | `/admin/permissions/:user/:section` | PermRW | `permissionsAPI.update(...)` |
| DELETE | `/admin/permissions/:user/:section` | PermRW | `permissionsAPI.remove(user, section)` |

### Páginas (`"Páginas"`)
| Método | Path | Handler TS |
|---|---|---|
| PUT | `/admin/pages/:page/availability` | `pagesAPI.setAvailability(page, bool)` |

### Riddles (`"Riddles"`)
| Método | Path | Handler TS | Notas |
|---|---|---|---|
| GET | `/admin/riddles` | `riddlesAPI.getAll(page, ...)` | paginado, ordenação e busca |
| GET | `/admin/riddles/:id` | `riddlesAPI.getByID(id)` | |
| POST | `/admin/riddles` | `riddlesAPI.create(data)` | |
| POST | `/admin/riddles/upload-csv` | `riddlesAPI.uploadCSV(file)` | CSV 4 colunas (título, subtítulo, resposta, imagem) — **hard delete** da fila; 409 se equipes em progresso |
| PUT | `/admin/riddles/:id` | `riddlesAPI.update(id, data)` | inclui toggle `is_active` |
| DELETE | `/admin/riddles/:id` | `riddlesAPI.delete(id)` | soft delete |

> UI em `pages/Riddles` (`/riddles`). Campo `is_active` usa `interactiveToggle` na CrudTable.
> → [[Feature_Riddle_e_Jogo]]

---

## Mapeamento de Campos Críticos

### Event
| Frontend | Backend |
|---|---|
| `nameEvent` | `name` |
| `dateInit` | `init_date` |
| `dateEnd` | `end_date` |
| `local` | `location` |
| `hasPresence` | `has_attendance` |

### Presence
| Frontend | Backend |
|---|---|
| `user_number` | `user_number` |
| `name_event` | `event_name` |
| `date_event` | `event_init_date` |
| `user_backoffice` | `email_admin` |

### User Semcomp
| Frontend | Backend |
|---|---|
| `id` | `user_number` (string formatado como `%05d`) |
| `presence_rate` | `presence_rate` |

### Kit
| Frontend | Backend |
|---|---|
| `kitName` | `name` |
| `kitSize` | `size` |
| `kitColor` | `color` |
| `kitIsBabylook` | `is_babylook` (antes `is_babydoll`) |

---

## API Barrel (Backoffice)
Arquivo: `src/api/index.ts` — exporta: `authAPI`, `userBackofficeAPI`, `userSemcompAPI`, `eventsAPI`, `sectionsAPI`, `participationAPI`, `productsAPI`, `permissionsAPI`, `pagesAPI`, `sponsorsAPI`, `salesAPI`, `riddlesAPI`, `client`
