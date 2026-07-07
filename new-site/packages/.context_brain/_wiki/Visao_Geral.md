---
type: wiki-overview
tags: [overview, monorepo, architecture, golang, react, vite]
---
# Visão Geral

## Monorepo
Raiz do vault: `semcomp/new-site/packages/`

| Pacote | Tecnologia | Porta (dev) | Propósito |
|---|---|---|---|
| `backend` | Go + Gin + GORM | **4000** | API REST + PostgreSQL |
| `front-site` | React 18 + Vite + TS | **5173** | Site público do participante |
| `front-backoffice` | React 18 + Vite + TS | **5174** (base `/admin`) | Painel administrativo |

## Configuração de URL (ambos os frontends)
Arquivos: `front-*/src/constants/ApiURL.ts` + `DebugMode.ts`
- `DEBUGMODE = false` → `https://semcomp.icmc.usp.br/api` (produção)
- `DEBUGMODE = true` → `http://localhost:4000` (dev)

## Backend — Domínios Internos
→ Detalhes em [[Backend_Arquitetura]]

| Módulo | Responsabilidade |
|---|---|
| `auth` | Login/profile do participante (JWT site) |
| `authBackoffice` | Login admin + retorna array de permissões (JWT backoffice) |
| `user` | CRUD de participantes (tabela `users`) |
| `userBackoffice` | CRUD de admins (tabela `users_backoffice`) |
| `event` | CRUD de eventos da Semcomp (PK composta: name+init_date) |
| `section` | Trilhas/categorias dos eventos (inicializa padrões na startup) |
| `presence` | Registro de presença participante↔evento (PK tripla) |
| `permission` | Controle de acesso admin por seção (`"R"` / `"RW"`) |
| `log` | Auditoria automática via middleware de todas as requisições |
| `middleware` | Guards JWT para site (`AuthMiddleware`) e backoffice (`AuthBackofficeMiddleware`) |
| `providers` | bcrypt (senha) + JWT HS256 (token, 2 fluxos) |
| `database` | Conexão PostgreSQL + AutoMigrate |

## Frontend — Site Público
→ Ver [[Front_Paginas_e_Rotas]]

5 rotas: `/` Home (6 partes), `/cronograma` (agrupa eventos sobrepostos), `/login`, `/profile` (protegida, tem QR Code), `*` NotFound  
Estado global: [[Front_Hooks_e_Estados#AuthContext_Site]] + [[Front_Hooks_e_Estados#ThemeContext]] + [[Front_Hooks_e_Estados#NotificationContext]]  
API exports (barrel `src/api/index.ts`): apenas `authAPI` e `client` — `eventsAPI` e `authAPI.getProfile` são importados diretamente dos arquivos

## Frontend — Backoffice
→ Ver [[Backoffice_Contextos_e_Lib]] e [[Front_Paginas_e_Rotas]]

8 rotas em `/admin/*`, 6 módulos CRUD navegáveis via tela Home (Tabs):

| Tab | Rota | Status integração |
|---|---|---|
| Seções | `/sections` | ✅ integrado |
| Eventos | `/events` (+ `/events/:n/:d/qrcode-reader`) | ✅ integrado |
| Usuários Backoffice | `/backoffice-users` | ✅ integrado |
| Usuários Semcomp | `/semcomp-users` | ✅ integrado |
| Participações | `/participation` | ✅ integrado |
| Permissões | `/permissions` | ⚠️ mock (TODO) |

Estado global: [[Front_Hooks_e_Estados#AuthContext_Backoffice]]  
API barrel (`src/api/index.ts`): `authAPI`, `userBackofficeAPI`, `userSemcompAPI`, `eventsAPI`, `sectionsAPI`, `participationAPI`, `client`  
**Ausente no barrel**: `permissionsAPI` (página usa mock)

## Autenticação — Dois Fluxos JWT
| Fluxo | Endpoint | Token localStorage | Claims |
|---|---|---|---|
| Site | `POST /login` | `semcomp-site-token` | `{ id: UserNumber, sub: email }` |
| Backoffice | `POST /admin/login` | `semcomp-backoffice-token` | `{ sub: email }` + retorna `permissions[]` |

→ Ver [[Integracao_API]] para mapeamento completo de endpoints
