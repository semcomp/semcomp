# backend

API REST da Semcomp. Go 1.25 + Gin + GORM + PostgreSQL, servida em `http://localhost:4000`.

Este README documenta o mapa de módulos em `internal/`, o padrão de camadas usado em cada módulo e como rodar o backend localmente sem Docker. Para a arquitetura do monorepo como um todo (frontends, RBAC, fluxos de auth), veja `../.context_brain/_wiki/`.

## Como rodar localmente (sem Docker)

Pré-requisitos: Go 1.25+ e um PostgreSQL rodando localmente (instalado nativamente ou via `docker run` avulso — o backend em si não depende de Docker, só precisa de um Postgres acessível).

1. **Suba um Postgres local** (se ainda não tiver um), criando o banco/usuário usados no passo 2. Exemplo com o Postgres instalado no SO:
   ```bash
   sudo -u postgres psql -c "CREATE USER semcomp WITH PASSWORD '123456';"
   sudo -u postgres psql -c "CREATE DATABASE semcompdb OWNER semcomp;"
   ```
2. **Copie o `.env.example` para `.env`** e ajuste conforme seu Postgres local:
   ```bash
   cp .env.example .env
   ```
   Variáveis relevantes para rodar localmente:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — conexão com o Postgres
   - `JWT_SECRET`, `JWT_EXPIRES_IN_HOURS` — assinatura dos tokens (site e backoffice)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — credenciais do admin padrão, criado automaticamente no startup (`userBackofficeService.InitializeAdmin`) caso não exista
   - `FRONTEND_URL` — usada para montar o link de confirmação de e-mail
   - `SMTP_*` — só necessário se for testar o fluxo de verificação de e-mail (`/register`, `/verify-email`, `/resend-verification`); sem SMTP configurado, o envio falha mas o resto da API funciona
   - `MERCADOPAGO_*` — só necessário para testar `/webhook/mercadopago` e o fluxo de pagamento (`/api/payments/*`)
3. **Rode a API**:
   ```bash
   go run cmd/api/main.go
   ```
   No startup, o backend: conecta ao Postgres com retry automático (10 tentativas, 3s de intervalo — não precisa esperar o Postgres subir antes), roda `AutoMigrate` em todas as tabelas, inicializa o admin padrão, as permissões padrão (`KnownSections`) e o catálogo de produtos.
4. **Swagger**: com a API rodando, a documentação interativa fica em `http://localhost:4000/swagger/index.html`.

Não há `docker-compose.yml` neste pacote — o `Dockerfile` existente é só para build de produção (multi-stage, imagem distroless). Para rodar com Docker seria necessário prover um Postgres externo e passar as envs manualmente.

### Testes
```bash
go test ./...
```
Módulos com testes hoje: `internal/auth`, `internal/user`, `internal/presence`, `internal/providers`.

## Mapa dos módulos (`internal/`)

| Módulo | Camadas | Responsabilidade |
|---|---|---|
| `auth` | handler, service | Login do site (`POST /login`) e perfil (`GET /api/profile`). Não tem repository próprio — reutiliza `user.UserRepository`. |
| `authBackoffice` | handler, service | Login do backoffice (`POST /admin/login`), retorna token + `permissions[]`. Reutiliza `userBackoffice.UserBackofficeRepository`. |
| `user` | handler, service, repository | CRUD de participantes (tabela `users`), cadastro (`/register`), esqueci-minha-senha, verificação de e-mail (`PapfeDocument` também vive aqui). |
| `userBackoffice` | handler, service, repository | CRUD de admins (tabela `users_backoffice`). `InitializeAdmin()` cria o admin padrão (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) no startup se não existir. |
| `event` | handler, service, repository, model | CRUD de eventos da Semcomp. PK composta (`name` + `init_date`), por isso as rotas usam `:eventName/:initDate` em vez de `:id`. |
| `presence` | handler, service, repository, model | Registro de presença participante↔evento (PK tripla: usuário+evento+data). |
| `product` | handler, service, repository, model | Catálogo da loja (produtos, kits, combos). `InitializeProducts()` popula o catálogo padrão no startup. |
| `payment` | handler, service, repository, model | Integração com Mercado Pago (Pix), webhook e consulta de status de pagamento. |
| `permission` | handler, service, repository, model | RBAC do backoffice: `KnownSections` (lista fixa de seções), níveis `"R"`/`"RW"`, `CheckPermission`, seed automático de permissões. |
| `pages` | handler, service | Feature flags de páginas do site (`home`, `login`, `cronograma`, `profile`, `riddle`, `loja`). Estado **em memória** (não persiste no banco nem sobrevive a restart) — não tem repository. |
| `log` | model, service, repository | Auditoria automática: toda requisição é registrada via `middleware.AuditMiddleware`. |
| `token` | model, repository | Tokens de verificação de e-mail (armazenamento e expiração). Sem handler/service — é consumido diretamente pelo `user`. |
| `mailer` | — | Envio de e-mail via SMTP (`gomail`), usado pelo `user` para o fluxo de verificação de conta. |
| `middleware` | — | Guards reutilizáveis: `AuthMiddleware`/`AuthBackofficeMiddleware` (JWT), `RequirePermission` (RBAC), `RequirePageAvailable` (feature flag), `AuditMiddleware` (log). |
| `providers` | — | Infra transversal: bcrypt (senha), JWT HS256 (dois fluxos: site e backoffice), token de verificação de e-mail, validação de e-mail, envio de e-mail. |
| `database` | — | Conexão com Postgres (retry com backoff) + pool de conexões. |
| `apierrors` | — | Tipo `APIError` unificado (`Code`, `Message`, `Status`, `Err`) e construtores (`ValidationError`, `NotFoundError`, `ConflictError`, `InternalServerError`...) + `HandleAPIError` para traduzir em resposta JSON. |
| `docs` | — | Gerado automaticamente pelo `swag` (Swagger/OpenAPI) a partir dos comentários `@Summary`/`@Router` nos handlers. Não editar manualmente. |

## Padrão de cada módulo (handler → service → repository)

A maioria dos módulos de domínio (`event`, `presence`, `product`, `payment`, `permission`, `user`, `userBackoffice`, `log`) segue as mesmas 3-4 camadas, todas dentro do próprio pacote (`internal/<modulo>/`, sem subpastas):

```
model.go       → structs GORM (entidade) + DTOs de request/response (Create*Request, Update*Request, *ListQuery, *ListResult)
repository.go  → interface <Nome>Repository + struct privada com *gorm.DB; só SQL/GORM, sem regra de negócio
service.go     → interface <Nome>Service + struct privada com o Repository (por interface, não struct concreta); validações e regra de negócio
handler.go     → struct <Nome>Handler com o Service; faz bind do JSON, chama o service, traduz erro/sucesso pra HTTP; comentários @Summary/@Router geram o Swagger
```

Convenções:
- Cada camada expõe uma **interface** e um construtor `New<Camada>(...)` que recebe a camada de baixo por interface (injeção de dependência manual, sem framework de DI) — a fiação acontece toda em `cmd/api/main.go`.
- Erros de negócio usam `apierrors.APIError` (ex.: `apierrors.ConflictError("Evento já existe", err)`), propagados do repository/service até o handler, que chama `apierrors.HandleAPIError(c, err)` para converter em JSON + status HTTP.
- Listagens paginadas seguem o padrão `<Nome>ListQuery` (Limit, Offset, SortBy, SortOrder, SearchBy, SearchValue) → `<Nome>ListResult` (dados + `TotalRecords` + `FilteredRecords`).
- Módulos sem regra de negócio relevante pulam camadas: `pages` (estado em memória, sem repository), `auth`/`authBackoffice` (sem repository próprio, delegam para `user`/`userBackoffice`), `token` (sem handler/service, é infraestrutura usada por `user`).

### Exemplo: `event`
- `model.go` — `Event` (entidade, PK composta `Name`+`InitDate`), `CreateEventRequest`, `UpdateEventRequest`, `EventListQuery`, `EventListResult`.
- `repository.go` — `EventRepository` (`Create`, `GetByNameAndInitTime`, `UpdateByNameAndInitTime`, `DeleteByNameAndInitTime`, `GetEvents`).
- `service.go` — `EventService` recebe `EventRepository`; ex. `CreateEvent` primeiro verifica duplicidade (`GetByNameAndInitTime`) antes de inserir.
- `handler.go` — `EventHandler` recebe `EventService`; cada método faz `ShouldBindJSON` → chama o service → `apierrors.HandleAPIError` ou `c.JSON`.

## Rotas — visão geral

Toda a montagem de rotas está em `cmd/api/main.go` (sem router separado). Três grupos:

- **Públicas** (`r.*`) — `/register`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`, `/resend-verification`, `/events`, `/event/:eventName/:initDate`, `/products`, `/webhook/mercadopago`, `/pages/*/availability`. Algumas passam por `pageMW("<page>")` (`middleware.RequirePageAvailable`), que bloqueia a rota se a feature flag da página estiver desligada.
- **Protegidas (site)** (`r.Group("/api")` + `AuthMiddleware`) — `/api/profile`, `/api/payments/*`.
- **Protegidas (backoffice)** (`r.Group("/admin")` + `AuthBackofficeMiddleware`, exceto `/admin/login`) — CRUDs de `users`, `events`, `presences`, `usersBackoffice`, `products`, `permissions`, `pages/:page/availability`. Cada rota de escrita/leitura usa `permMW("<Seção>", permission.PermR|PermRW)` (`middleware.RequirePermission`), onde `<Seção>` deve bater com uma entrada de `permission.KnownSections`. Exceção: `GET /admin/permissions/me` não exige permissão — qualquer admin autenticado consulta as próprias permissões (email vem do JWT, não da URL).

`middleware.AuditMiddleware` roda em toda requisição (`r.Use`, antes até do CORS) e grava um `log.AuditLog` por request.

## Como adicionar um novo módulo de domínio

1. Crie `internal/meurecurso/{model,repository,service,handler}.go` seguindo o padrão acima.
2. Registre a entidade em `db.AutoMigrate(...)` em `cmd/api/main.go`.
3. Instancie a cadeia `repo := meurecurso.NewRepository(db)` → `service := meurecurso.NewService(repo)` → `handler := meurecurso.NewHandler(service)` em `main.go`, junto dos demais.
4. Registre as rotas (`r.GET/POST/PUT/DELETE`) no grupo apropriado (`r`, `authRoutes` ou `admin`), usando `pageMW`/`permMW` se a rota precisar de feature flag ou RBAC.
5. Se for uma seção nova do backoffice, adicione o nome em `permission.KnownSections` (`internal/permission/model.go`) — isso é o que faz `permMW` e o seed automático de permissões reconhecerem a seção.
6. Rode `go run cmd/api/main.go` e valide via Swagger (`/swagger/index.html`) ou com os testes (`go test ./...`).
