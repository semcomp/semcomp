---
type: feature-flow
tags: [feature, riddle, enigma, jogo, equipe, sequência, backoffice, site]
---
# Feature: Riddle e Jogo de Enigmas

Jogo de sequência de enigmas: o backoffice cadastra a fila de riddles e o
participante (em equipe) resolve os enigmas **em ordem**, avançando pelo
progresso da equipe. Dois fluxos: CRUD de backoffice (com upload de CSV) e
jogo do participante no site.

---

## Modelo de Dados

Arquivo: `internal/riddle/` (`model.go`, `handler.go`, `service.go`, `repository.go`)

### Riddle
- `ID` autoincrement — **é a posição na fila**: o jogo resolve em sequência
  (id 1 → 2 → 3 …), nunca fora de ordem.
- `Hint1`, `Hint2` (título/subtítulo), `Answer`, `ImageURL`
- `IsActive` (default `true`) — controla a exclusão lógica (soft delete) e a
  visibilidade do enigma no jogo. "Último enigma" = `MAX(id)` filtrando apenas
  `is_active = true`.
- ⚠️ O struct `Riddle` serializa `Answer` — **só** é usado pelas rotas de
  backoffice. Um endpoint público do participante **não deve** serializar este
  struct diretamente; usa `PublicRiddle` (sem `Answer`), padrão `user.SafeUser`.

### Team / TeamMember
- `Team`: `Name`, `Code` (convite 8 chars, alfabeto sem ambíguos
  `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, gerado com crypto/rand, uniqueIndex),
  `CurrentRiddleIndex` (índice do próximo enigma; `0` = ainda não resolveu o
  primeiro; ultrapassar o maior id = terminou), `FinishedAt`.
- `TeamMember`: PK composta `TeamID + UserNumber` + **índice único em
  UserNumber** (garante a nível de banco que um participante pertence a no
  máximo 1 equipe). `MaxTeamSize = 5`.
- `TeamView`/`TeamMemberView` — só expõem `user_number` + `name`, sem vazar
  dados pessoais dos colegas (email, idade, …).

---

## Backoffice — CRUD de Riddles

Módulo: `internal/riddle` | Seção RBAC: **`"Riddles"`** (nova KnownSection)

| Método | Path | Guard | Handler |
|---|---|---|---|
| GET | `/admin/riddles` | PermR | `GetRiddles` |
| GET | `/admin/riddles/:id` | PermR | `GetRiddleByID` |
| POST | `/admin/riddles` | PermRW | `CreateRiddle` |
| POST | `/admin/riddles/upload-csv` | PermRW | `UploadRiddlesCSV` |
| PUT | `/admin/riddles/:id` | PermRW | `UpdateRiddle` |
| DELETE | `/admin/riddles/:id` | PermRW | `DeleteRiddle` |

- `CreateRiddle` sempre acrescenta ao **final da fila** (autoincrement do ID).
- `DeleteRiddle` = **soft delete** (`is_active=false`), preserva a ordem.
- `UpdateRiddle` inclui o toggle `IsActive`.
- `GetRiddles` lista **ativos e inativos** com paginação, ordenação
  (id/hint1/hint2/is_active/created_at) e busca (hint1/hint2/is_active).
- `UploadRiddlesCSV`: CSV de 4 colunas (título, subtítulo, resposta, link da
  imagem), **hard delete** da fila anterior (`ReplaceAll`). **Bloqueado (409)
  se houver equipes em progresso** — o hard delete recria os IDs e invalidaria
  o `CurrentRiddleIndex`.

Frontend: `front-backoffice/src/pages/Riddles/`, `data/riddlesCrudField.ts`,
`api/riddles.ts`, `types/RiddleType.ts`. Tab `"Riddles"` → rota `/riddles`
(`RequirePermission section="Riddles"`).

> **CrudTable estendida** para esta página (`components/CrudTable.tsx`):
> campo type `image-preview` (pré-visualização de URL no modal), `hideInEdit`/
> `hideInTable`, `interactiveToggle` (Switch `is_active` na célula com efeito
> imediato via `onToggleField`), e `onDelete` tornou-se opcional.

---

## Jogo do Participante (Site) — Rotas Autenticadas

Guard: `AuthMiddleware` + `pageMW("riddle")` (feature flag do riddle).
→ Endpoints: [[Integracao_API_Site#Rotas Site Autenticadas]]

| Método | Path | Handler |
|---|---|---|
| GET | `/api/riddles/my-game` | `GetMyGame` |
| POST | `/api/riddles/create-team` | `CreateTeam` |
| POST | `/api/riddles/join-team` | `JoinTeam` |
| POST | `/api/riddles/solve` | `SolveRiddle` |

### Fluxo
1. `GetMyGame` → `{ team, riddles_total, current_riddle }`. `team` nulo =
   ainda sem equipe; `current_riddle` nulo = terminou. `CountActiveRiddles`
   conta só os ativos. Se não há enigma ativo, a página mostra "O jogo ainda
   não começou".
2. `CreateTeam` — o participante autenticado cria a equipe (vira fundador) e
   recebe o `Code` de convite. 409 se já está em equipe.
3. `JoinTeam` — entra por código. 409 se time cheio (5) ou já em time.
4. `SolveRiddle` — valida a resposta do **próximo** enigma (`riddleID` deve
   bater com `next.ID`, senão `ErrRiddleNotUnlocked`). Acerta → avança de forma
   atômica (`AdvanceRiddle`); erra → mesma pergunta, tentativas ilimitadas.
   Ao resolver o último, marca `FinishedAt`.

### Erros de domínio
`ErrTeamFull` (5 membros), `ErrRiddleNotUnlocked` (fora de ordem),
`ErrUserAlreadyInTeam`, `ErrNoActiveRiddle`.

---

## Verificação de Resposta
- `strings.EqualFold` (`hint`, `answer`) — resposta **case-insensitive**.
- A resposta correta **nunca** chega ao cliente; `PublicRiddle` não a expõe.

---

## Referências
- Backend: [[Backend_Arquitetura#riddle]]
- Rotas site: [[Integracao_API_Site]] | Rotas backoffice: [[Integracao_API_Backoffice]]
- Feature flag: [[Feature_Flags_e_Pages]] (`"riddle"`)
- Backoffice: [[Backoffice_Paginas_e_Rotas]] | Site: [[Site_Paginas_e_Rotas]]
