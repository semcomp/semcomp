# Semcomp - Site

Monorepo do site da Semcomp 29. Contém o backend (API), o site público (participante) e o painel administrativo (backoffice).

## Estrutura do Projeto

```
packages/
├── backend/           # API REST - Go + Gin + GORM + PostgreSQL     (porta 4000)
├── front-site/        # Site público - React 18 + Vite + TypeScript  (porta 5173)
├── front-backoffice/  # Painel admin - React 18 + Vite + TypeScript  (porta 5174, base /admin)
├── docker-compose.yml
└── Makefile
```

---

## Pré-requisitos

| Ferramenta       | Uso                                 | Observação                            |
| ---------------- | ----------------------------------- | ------------------------------------- |
| Docker + Compose | Subir todo o stack com um comando   | Recomendado para maior agilidade      |
| Go               | Rodar o backend localmente          | Necessário apenas no dev local        |
| Node.js + npm    | Rodar os frontends localmente       | Necessário apenas no dev local        |
| PostgreSQL       | Banco de dados                      | Incluído no Docker Compose            |

> Não há exigência de versão específica. Use versões recentes e estáveis de cada ferramenta e espera-se que funcione corretamente.

---

## Variáveis de Ambiente

As credenciais e segredos são definidos pela equipe e compartilhados internamente entre os membros. Peça a um membro do time de desenvolvimento os valores para preencher os arquivos `.env`.

### Backend (`backend/.env`)

Copie o arquivo de exemplo e preencha com os valores reais:

```bash
cp backend/.env.example backend/.env
```

| Variável                                    | Descrição                                                       | Exemplo (`.env.example`)                   |
| ------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| `DB_HOST`                                   | Host do PostgreSQL                                              | `localhost` ou `db` (ver nota abaixo)      |
| `DB_PORT`                                   | Porta do PostgreSQL                                             | `5432`                                     |
| `DB_USER`                                   | Usuário do banco                                                | `semcomp`                                  |
| `DB_PASSWORD`                               | Senha do banco                                                  | `123456`                                   |
| `DB_NAME`                                   | Nome do banco                                                   | `semcompdb`                                |
| `JWT_SECRET`                                | Segredo para assinar tokens JWT (HS256)                         | `SEGREDO`                                  |
| `JWT_EXPIRES_IN_HOURS`                      | Tempo de expiração do JWT em horas                              | `24`                                       |
| `ADMIN_EMAIL`                               | E-mail do admin padrão (criado automaticamente na startup)      | `adm@semcomp.com`                          |
| `ADMIN_PASSWORD`                            | Senha do admin padrão                                           | `senhaforte`                               |
| `FRONTEND_URL`                              | URL do frontend (usada nos links de e-mail de verificação)      | `http://localhost:5173`                    |
| `SMTP_HOST`                                 | Host do servidor SMTP                                           | `smtp.example.com`                         |
| `SMTP_PORT`                                 | Porta do SMTP                                                   | `587`                                      |
| `SMTP_USER`                                 | Usuário SMTP                                                    | `usuario@example.com`                      |
| `SMTP_PASSWORD`                             | Senha SMTP                                                      | `senha`                                    |
| `SMTP_FROM`                                 | Remetente do e-mail                                             | `Semcomp <no-reply@semcomp.icmc.usp.br>`  |
| `EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_HOURS` | Expiração do token de verificação de e-mail (horas)             | `24`                                       |
| `EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS`| Intervalo mínimo entre reenvios do e-mail de verificação (seg.) | `60`                                       |
| `EMAIL_VERIFICATION_MAX_RESENDS_PER_DAY`    | Máximo de reenvios de verificação por dia                       | `5`                                        |

> **⚠ `DB_HOST` - Docker vs. Local**
>
> - **Via Docker Compose** (`make up`): use `DB_HOST=db`. O Compose resolve o nome do serviço internamente.
> - **Backend rodando localmente** (`go run`): use `DB_HOST=localhost`. O backend precisa alcançar o Postgres diretamente na máquina.

### Frontends (`front-site/.env` e `front-backoffice/.env`)

Copie o `.env.example` em cada frontend:

```bash
cp front-site/.env.example front-site/.env
cp front-backoffice/.env.example front-backoffice/.env
```

| Variável          | Descrição                                           | Dev local | Produção |
| ----------------- | --------------------------------------------------- | --------- | -------- |
| `VITE_DEBUG_MODE` | Alterna a base URL da API entre local e produção    | `true`    | `false`  |

Quando `VITE_DEBUG_MODE=true`, as requisições apontam para `http://localhost:4000`.
Quando `false`, apontam para `https://semcomp.icmc.usp.br/api`.

Essa lógica está definida em `front-*/src/constants/ApiURL.tsx`.

---

## Executando com Docker (recomendado)

O Docker Compose sobe todos os serviços de uma vez: banco, backend, site e backoffice.

### 1. Configure o `.env`

Certifique-se de que `backend/.env` existe e está preenchido (ver seção acima). Use `DB_HOST=db`.

### 2. Suba os containers

```bash
make build
```

### 3. Acesse

| Serviço    | URL                                |
| ---------- | ---------------------------------- |
| Site       | http://localhost:5173              |
| Backoffice | http://localhost:5174/admin        |
| API        | http://localhost:4000              |
| Swagger    | http://localhost:4000/swagger/index.html |

---

## Executando Localmente (sem Docker)

Útil para desenvolvimento, especialmente do backend. Possibilita testar mudanças mais rapidamente.

### Banco de dados

Suba apenas o PostgreSQL via Docker:

```bash
docker compose -p semcomp --env-file ./backend/.env up -d db
```

### Backend

```bash
cd backend
# Certifique-se de que o .env tem DB_HOST=localhost
go run cmd/api/main.go
```

O servidor estará disponível em `http://localhost:4000`.

### Front-site

```bash
cd front-site
npm install
npm run dev
```

Disponível em `http://localhost:5173`.

### Front-backoffice

```bash
cd front-backoffice
npm install
npm run dev
```

Disponível em `http://localhost:5174/admin`.

> Lembre-se que os `.env` dos frontends devem ter `VITE_DEBUG_MODE=true` para apontar para a API local.

---

## Makefile - Referência de Comandos

Todos os comandos devem ser executados a partir do diretório `packages/`.

### Ciclo de vida dos containers

| Comando        | Descrição                                                               |
| -------------- | ----------------------------------------------------------------------- |
| `make up`      | Sobe os containers (sem rebuild)                                        |
| `make build`   | Sobe os containers com rebuild das imagens                              |
| `make down`    | Para e remove os containers                                             |
| `make restart` | Para, rebuilda e sobe tudo novamente                                    |
| `make reset`   | Remove containers e volumes (apaga dados do banco) e rebuilda tudo      |
| `make ps`      | Lista o status de todos os containers                                   |

### Logs

| Comando              | Descrição                       |
| -------------------- | ------------------------------- |
| `make logs`          | Logs de todos os serviços       |
| `make logs-front`    | Logs do front-site              |
| `make logs-backoffice` | Logs do backoffice            |
| `make logs-backend`  | Logs do backend                 |
| `make logs-db`       | Logs do PostgreSQL              |

### Acesso a shell dos containers

| Comando               | Descrição                            |
| ---------------------- | ------------------------------------ |
| `make bash-front`     | Shell no container do front-site      |
| `make bash-backoffice`| Shell no container do backoffice      |
| `make bash-backend`   | Shell no container do backend         |
| `make psql`           | Abre o cliente `psql` no container do banco |
