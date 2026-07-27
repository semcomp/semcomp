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

### Produtos (`"Produtos"`) — sem UI no backoffice
| Método | Path |
|---|---|
| GET | `/admin/products` |
| GET | `/admin/products/:id` |
| POST | `/admin/products` |
| PUT | `/admin/products/:id` |
| DELETE | `/admin/products/:id` |

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

---

## API Barrel (Backoffice)
Arquivo: `src/api/index.ts` — exporta: `authAPI`, `userBackofficeAPI`, `userSemcompAPI`, `eventsAPI`, `participationAPI`, `permissionsAPI`, `pagesAPI`, `client`
