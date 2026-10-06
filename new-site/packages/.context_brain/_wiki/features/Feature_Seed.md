---
type: wiki-feature
tags: [seed, database, testing, devtools, docker]
---
# Feature: Seed de Dados de Exemplo

Entrypoint: `backend/cmd/seed/main.go`  
Binário separado da API; compilado no mesmo `Dockerfile`, executado sob demanda via `make seed`.

---

## Propósito

Popula o banco local com dados representativos de todas as tabelas do backoffice para facilitar testes manuais e visuais. Não é executado na startup normal — só quando chamado explicitamente.

---

## Comandos

```bash
make seed    # rebuilda imagem + executa ./seed no container
make unseed  # remove todos os dados de seed via SQL (sem rebuild)
```

- `make seed` requer o container `db` saudável (healthcheck); usa `docker compose run --rm --entrypoint ./seed backend`
- `make unseed` requer apenas o `db` em execução; usa `docker compose exec -T db psql < unseed.sql`

---

## Identificação

Todos os registros usam um marcador único para não se misturar com dados reais:

| Tipo de dado       | Padrão                                   |
|--------------------|------------------------------------------|
| E-mails de usuário | `seed.*@teste.semcomp.com`              |
| Nomes de entidades | prefixo `[SEED]`                         |
| Arquivos PAPFE     | `uploads/papfe/seed_*`                   |
| Justificativas     | `uploads/absence-justifications/seed_*`  |

---

## Tabelas cobertas e quantidade

| Tabela                   | Qtd  |
|--------------------------|------|
| presence_type_weights    | 16   |
| users                    | 22   |
| events                   | 22   |
| products (kits)          | 7    |
| products (coffees)       | 5    |
| products (combos)        | 4    |
| signin_events            | 44   |
| presences                | 44   |
| sales + sale_items       | 22   |
| consumed_items           | 7    |
| riddles                  | 15   |
| teams + team_members     | 5/15 |
| sponsors + packages      | 7/9  |
| notices                  | 10   |
| papfe_documents          | 10   |
| absence_justifications   | 10   |

---

## Idempotência

Cada seção conta os registros pelo marcador antes de inserir. Se `COUNT > 0`, pula e reusa os IDs para as tabelas dependentes. Isso torna o `make seed` seguro para rodar múltiplas vezes.

Exceção: `presence_type_weights` usa `FirstOrCreate` (não tem prefixo [SEED] — são dados de configuração compartilhados).

---

## Implementação

### Fluxo de execução (`main()`)

```
seedPresenceTypeWeights → seedUsers → seedEvents → seedProductCatalog
→ seedSigninEvents → seedPresences → seedSales
→ seedRiddles → seedTeams → seedSponsors → seedNotices
→ seedPapfeDocs → seedAbsenceJustifications
```

### Padrão de idempotência por seção

```go
var n int64
db.Model(&T{}).Where("name LIKE ?", "[SEED]%").Count(&n)
if n > 0 {
    // re-query para reusar IDs
    db.Where(...).Find(&out)
    return out
}
// insere normalmente
```

### Teams (tabela sem AutoMigrate)

`teams` e `team_members` são criadas via SQL raw na startup — não passam pelo AutoMigrate. O seed usa `db.Table("teams").Create(&localStruct)` com uma struct local anotada com `gorm:"column:..."`.

### ConsumedItems (lock de consumo único)

Criados apenas para vendas com status `PAGO` ou `PENDENTE` cujos itens sejam do tipo `COFFEE` ou `COMBO`. Reflete a invariante de negócio: coffees só podem ser consumidos uma vez, e só existem registros de consumed_item para vendas ativas.

---

## Remoção (`unseed.sql`)

`backend/scripts/unseed.sql` — delete em ordem de FK dentro de uma única transação:

```sql
BEGIN;
DELETE FROM consumed_items  WHERE user_number IN (SELECT user_number FROM users WHERE email LIKE 'seed.%@teste.semcomp.com');
DELETE FROM sales           WHERE sale_user_number IN (...);
DELETE FROM signin_events   WHERE event_name LIKE '[SEED]%';
DELETE FROM presences       WHERE event_name LIKE '[SEED]%';
DELETE FROM absence_justifications WHERE user_email LIKE 'seed.%@teste.semcomp.com';
DELETE FROM team_members    WHERE user_number IN (...);
DELETE FROM teams           WHERE name LIKE '[SEED]%';
DELETE FROM users           WHERE email LIKE 'seed.%@teste.semcomp.com';
DELETE FROM events          WHERE name LIKE '[SEED]%';
DELETE FROM products        WHERE name LIKE '[SEED]%' AND type = 'COMBO';   -- COMBOs primeiro (OnDelete:RESTRICT em combo_items)
DELETE FROM products        WHERE name LIKE '[SEED]%' AND type IN ('KIT', 'COFFEE');
DELETE FROM sponsors        WHERE name LIKE '[SEED]%';
DELETE FROM notices         WHERE title LIKE '[SEED]%';
DELETE FROM riddles         WHERE hint1 LIKE '[SEED]%';
COMMIT;
```

> `papfe_documents` não aparece: tem `OnDelete:CASCADE` na FK de `users` — deletado automaticamente com o usuário.

---

## Dados dos eventos

Programação completa da Semcomp 29 (06–10/out/2026) com nomes reais dos tipos de evento:
`Abertura`, `Coffee`, `Minicurso`, `Palestra`, `Oficina`, `Rodas de conversa`, `Vitrine`, `Gamenight`, `Concursos`, `Luau`, `Jogos de rua`, `Encerramento`.

Eventos com `has_attendance=true` (Palestra, Vitrine) recebem presenças.  
Eventos com `has_signin=true` (Minicurso, Oficina, Gamenight, Concursos, Luau, Jogos de rua) recebem inscrições.

---

## Arquivos

| Arquivo                            | Papel                                          |
|------------------------------------|------------------------------------------------|
| `backend/cmd/seed/main.go`         | Lógica principal do seed                       |
| `backend/scripts/unseed.sql`       | SQL de remoção em ordem de FK                  |
| `backend/cmd/seed/README.md`       | Documentação detalhada com tabela de usuários  |
| `Makefile` (`seed`, `unseed`)      | Targets de execução via Docker                 |
| `backend/Dockerfile`               | Compila `./seed` no estágio `builder`          |
