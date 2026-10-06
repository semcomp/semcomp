# Seed do Banco de Dados

Script Go que popula o banco PostgreSQL com dados de exemplo para facilitar testes no backoffice.  
Todos os registros são identificados pelo prefixo `[SEED]` (nomes) ou domínio `@teste.semcomp.com` (e-mails), tornando fácil distingui-los e removê-los.

---

## Como rodar

O seed roda como um binário separado dentro do container Docker — não interfere na API principal.

```bash
# a partir de packages/
make seed
```

O comando rebuilda a imagem do backend (que compila o binário `./seed`) e o executa em um container efêmero com acesso ao banco.

> Requer que o container do banco de dados (`db`) esteja de pé. Rode `make up` ou `make build` antes, se necessário.

---

## Como desfazer

```bash
# a partir de packages/
make unseed
```

Executa `backend/scripts/unseed.sql` diretamente no banco via `psql`. Remove todos os dados de seed na ordem correta de FK (sem afetar dados reais).

> Requer apenas o container `db` em execução. Não rebuild da imagem.

---

## Idempotência

O seed é seguro para rodar múltiplas vezes. Antes de cada seção, ele verifica se já existem registros com o prefixo/domínio de seed:

- Se existirem: pula a inserção e reusa os IDs para as tabelas dependentes
- Se não existirem: insere normalmente

---

## O que é inserido

| Tabela                    | Qtd | Detalhes                                                                                              |
|---------------------------|-----|-------------------------------------------------------------------------------------------------------|
| `presence_type_weights`   | 16  | Palestra=1.0, Vitrine=0.5, demais=0.0 — idempotente via `FirstOrCreate`                               |
| `users`                   | 22  | Senha `senha123`; perfis variados (cidade, deficiência, verificação de e-mail, PAPFE, LinkedIn etc.)  |
| `events`                  | 22  | Programação completa da Semcomp 29 (06–10/out/2026): abertura, palestras, minicursos, oficinas, luau  |
| `products`                | 16  | 7 kits (P/M/G/GG + babylook P/M/G), 5 coffees, 4 combos                                               |
| `signin_events`           | 44  | 2 inscrições por usuário; statuses: REGISTERED, WAIT_LISTED, WAITING_DONATION, CANCELLED              |
| `presences`               | 44  | 2 presenças por usuário nos eventos com `has_attendance=true`                                          |
| `sales` + `sale_items`    | 22  | Todos os statuses (PAGO, PENDENTE, CANCELADO, REJEITADO, EXPIRADO, REEMBOLSADO); kits, coffees, combos |
| `consumed_items`          | 7   | Criados para vendas PAGO/PENDENTE que contêm coffee ou combo (travamento de consumo único)             |
| `riddles`                 | 15  | 13 ativos + 2 inativos                                                                                 |
| `teams` + `team_members`  | 5/15| Equipes com 1–5 membros; uma finalizada (`finished_at` preenchido)                                    |
| `sponsors`                | 7   | 2 Ouro, 2 Prata, 3 Bronze + 9 pacotes (alguns com pacotes de anos anteriores)                          |
| `notices`                 | 10  | Avisos gerais, regras do jogo, certificados, resultado do concurso                                     |
| `papfe_documents`         | 10  | Apenas para usuários com `has_papfe=true`; statuses: pendente, aprovado, rejeitado                     |
| `absence_justifications`  | 10  | Statuses: em_analise, aprovado, negado, documento_invalido                                             |

---

## Identificação dos dados de seed

| Critério             | Padrão                                      |
|----------------------|---------------------------------------------|
| E-mails de usuário   | `seed.*@teste.semcomp.com`                 |
| Nomes de entidades   | prefixo `[SEED]` (eventos, produtos, etc.) |
| QR codes de venda    | `SEED-QR-<número>`                         |
| IDs do Mercado Pago  | `SEED-MP-<número>`                         |
| Arquivos PAPFE       | `uploads/papfe/seed_*`                     |
| Justificativas       | `uploads/absence-justifications/seed_*`    |

---

## Credenciais dos usuários de seed

Senha de todos: **`senha123`**

| Nome              | E-mail                              | Verificado | PAPFE |
|-------------------|-------------------------------------|------------|-------|
| Alice Pereira     | seed.alice@teste.semcomp.com        | ✅          | ✅     |
| Bruno Santos      | seed.bruno@teste.semcomp.com        | ✅          | ❌     |
| Carla Oliveira    | seed.carla@teste.semcomp.com        | ✅          | ❌     |
| Daniel Rocha      | seed.daniel@teste.semcomp.com       | ✅          | ✅     |
| Eva Lima          | seed.eva@teste.semcomp.com          | ❌          | ❌     |
| Felipe Cardoso    | seed.felipe@teste.semcomp.com       | ✅          | ✅     |
| Gabriela Mendes   | seed.gabriela@teste.semcomp.com     | ✅          | ❌     |
| Henrique Souza    | seed.henrique@teste.semcomp.com     | ✅          | ❌     |
| Isabela Teixeira  | seed.isabela@teste.semcomp.com      | ✅          | ✅     |
| João Vitor Nunes  | seed.joaovitor@teste.semcomp.com    | ✅          | ✅     |
| Larissa Ferreira  | seed.larissa@teste.semcomp.com      | ✅          | ❌     |
| Marcos Alves      | seed.marcos@teste.semcomp.com       | ❌          | ❌     |
| Natalia Costa     | seed.natalia@teste.semcomp.com      | ✅          | ✅     |
| Otávio Pires      | seed.otavio@teste.semcomp.com       | ✅          | ❌     |
| Paula Monteiro    | seed.paula@teste.semcomp.com        | ✅          | ❌     |
| Rafael Neves      | seed.rafael@teste.semcomp.com       | ✅          | ✅     |
| Sabrina Lopes     | seed.sabrina@teste.semcomp.com      | ❌          | ❌     |
| Thiago Barbosa    | seed.thiago@teste.semcomp.com       | ✅          | ✅     |
| Ursula Vaz        | seed.ursula@teste.semcomp.com       | ✅          | ❌     |
| Vitor Azevedo     | seed.vitor@teste.semcomp.com        | ✅          | ❌     |
| Wendy Correia     | seed.wendy@teste.semcomp.com        | ✅          | ✅     |
| Xavier Mello      | seed.xavier@teste.semcomp.com       | ✅          | ✅     |

O admin do backoffice é criado pela API na startup; suas credenciais são as definidas em `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`.

---

## Implementação

- **Entrypoint:** `backend/cmd/seed/main.go`
- **Binário:** compilado no estágio `builder` do `Dockerfile` como `./seed`
- **Execução:** `docker compose run --rm --entrypoint ./seed backend` (via `make seed`)
- **Remoção:** `backend/scripts/unseed.sql` executado via `psql` no container `db` (via `make unseed`)
- **Ordem de FK no unseed:** `consumed_items` → `sales` → `signin_events` → `presences` → `absence_justifications` → `team_members` → `teams` → `users` → `events` → `products COMBO` → `products KIT/COFFEE` → `sponsors` → `notices` → `riddles`
