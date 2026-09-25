# Seed do Banco de Dados

Script Go que popula o banco PostgreSQL local com dados de exemplo para desenvolvimento.

## O que é inserido

| Entidade              | Qtd | Detalhes                                                                          |
|-----------------------|-----|-----------------------------------------------------------------------------------|
| Pesos de presença     | 16  | Todos os tipos (Palestra=1.0, Vitrine=0.5, demais=0.0)                            |
| Usuários Semcomp      | 12  | Senha padrão `senha1234`; 2 com e-mail não verificado; variados perfis e cidades  |
| Eventos               | 22  | Programação completa de 5 dias: abertura, palestras, minicursos, oficinas, luau…  |
| Patrocinadores        | 7   | 2 Ouro, 2 Prata, 3 Bronze — alguns com pacotes de anos anteriores também          |
| Produtos              | 16  | 7 kits (P/M/G/GG + babylook P/M/G), 5 coffees e 4 combos                          |
| Avisos                | 7   | Avisos gerais, regras do jogo, certificados, resultado do concurso                |
| Riddles               | 12  | 10 ativos + 2 inativos (exemplos de estados desabilitado e bônus)                 |

> O seed é **idempotente**: pode ser rodado várias vezes sem duplicar dados.
> Usuários de backoffice e o admin já são criados pela própria API no startup
> (via `ADMIN_EMAIL`/`ADMIN_PASSWORD` no `.env`), por isso o seed não os recria.

---

## Pré-requisitos

1. **Go** ≥ 1.22
2. **PostgreSQL** em execução (local ou via Docker)
3. Arquivo **`.env`** configurado na raiz do backend (`packages/backend/.env`)

O `.env.example` tem um modelo completo. Para desenvolvimento local, basta:

```bash
cp .env.example .env
# edite as variáveis DB_* se necessário
```

Se quiser subir o banco via Docker, use o `docker-compose.yml` na pasta `packages/`:

```bash
# a partir de packages/
docker compose up -d postgres
```

---

## Como rodar

A partir do diretório `packages/backend/`:

```bash
# opção 1 - executa diretamente (sem gerar binário)
go run ./cmd/seed

# opção 2 - compila e executa
go build -o seed ./cmd/seed
./seed
```

O script lê o `.env` automaticamente (via `godotenv`) e imprime o progresso de cada etapa no stdout.

---

## Resetar o banco antes do seed

Para começar do zero (apaga todos os dados):

```bash
# via psql (substitua as credenciais conforme seu .env)
psql -h localhost -U semcomp -d semcompdb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# As tabelas são recriadas pelo AutoMigrate da API. Suba a API uma vez antes do seed:
go run ./cmd/api &   # aguarde "Banco conectado" e mate com Ctrl+C
go run ./cmd/seed    # popula os dados
```

---

## Credenciais dos usuários de seed

Todos os usuários abaixo têm senha `senha1234`.

| #  | Nome              | E-mail                   | Verificado | PAPFE |
|----|-------------------|--------------------------|------------|-------|
| 1  | Alice Pereira     | alice@example.com        | ✅          | ✅     |
| 2  | Bruno Santos      | bruno@example.com        | ✅          | ❌     |
| 3  | Carla Oliveira    | carla@example.com        | ✅          | ❌     |
| 4  | Daniel Rocha      | daniel@example.com       | ✅          | ✅     |
| 5  | Eva Lima          | eva@example.com          | ❌          | ❌     |
| 6  | Felipe Cardoso    | felipe@example.com       | ✅          | ✅     |
| 7  | Gabriela Mendes   | gabriela@example.com     | ✅          | ❌     |
| 8  | Henrique Souza    | henrique@example.com     | ✅          | ❌     |
| 9  | Isabela Teixeira  | isabela@example.com      | ✅          | ✅     |
| 10 | João Vitor Nunes  | joaovitor@example.com    | ✅          | ✅     |
| 11 | Larissa Ferreira  | larissa@example.com      | ✅          | ❌     |
| 12 | Marcos Alves      | marcos@example.com       | ❌          | ❌     |

O admin do backoffice é criado pela API; suas credenciais são as definidas em
`ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`.
