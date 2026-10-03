# Plano: Event Type como FK + Dropdown no Backoffice

## Contexto

Atualmente, o campo `type` de um evento é uma string livre no banco. Os pesos de presença são gerenciados em uma tabela separada (`presence_type_weights`) e o cálculo de presença faz match por string (case-insensitive). O objetivo é:
1. Transformar `Event.Type` em uma FK para `presence_type_weights`
2. No frontoffice, trocar o input de texto por um dropdown populado a partir dos tipos já cadastrados
3. Criar 17 tipos padrão com pesos e defaults de presença
4. Manter o fluxo de criação de evento funcional (FK é opcional)

## Decisões Confirmadas

- **FK nullable**: `presence_type_weight_id` é opcional (permite criar evento sem tipo)
- **has_attendance default**: Pré-preenchido ao selecionar tipo, mas editável por evento
- **Delete constraint**: Bloquear exclusão de tipo que tenha eventos vinculados
- **API response**: Incluir `type_name` via join + manter `type` para compatibilidade

---

## 1. Backend - Modelos

### 1.1 `backend/internal/presencesettings/model.go`
- Adicionar campo `DefaultHasAttendance bool` ao struct `PresenceTypeWeight`:
  ```go
  DefaultHasAttendance bool `gorm:"not null;default:false" json:"default_has_attendance"`
  ```
- Atualizar `CreatePresenceTypeWeightRequest` e `UpdatePresenceTypeWeightRequest` para incluir o campo

### 1.2 `backend/internal/event/model.go`
- Substituir `Type string` por `PresenceTypeID *uint` (FK nullable):
  ```go
  PresenceTypeID     *uint                        `gorm:"index" json:"presence_type_weight_id"`
  PresenceTypeWeight  presencesettings.PresenceTypeWeight `gorm:"foreignKey:PresenceTypeID;constraint:OnDelete:SET NULL" json:"-"`
  ```
- Manter `Type string` temporariamente para compatibilidade durante migração (será removido depois)
- Atualizar `CreateEventRequest` e `UpdateEventRequest` para incluir `PresenceTypeID *uint`

### 1.3 `backend/internal/event/handler.go`
- Na resposta JSON, incluir `type` derivado do join (via campo virtual ou override no handler)

---

## 2. Backend - Seeds de Tipos Padrão

### 2.1 `backend/internal/presencesettings/service.go`
- Atualizar `DefaultTypeWeights` com todos os 17 tipos:

**Com peso > 0 e `default_has_attendance = true`:**
| TypeName | Weight | DefaultHasAttendance |
|----------|--------|---------------------|
| Palestra | 1.0 | true |
| Vitrine | 0.5 | true |

**Com peso 0 e `default_has_attendance = false`:**
| TypeName | Weight | DefaultHasAttendance |
|----------|--------|---------------------|
| Rodas de conversa | 0.0 | false |
| Minicurso | 0.0 | false |
| Concursos | 0.0 | false |
| Luau | 0.0 | false |
| Gamenight | 0.0 | false |
| Oficina | 0.0 | false |
| Contest | 0.0 | false |
| Jogos de rua | 0.0 | false |
| Coffee | 0.0 | false |
| Coffee Livre | 0.0 | false |
| Coffee Noturno | 0.0 | false |
| Feira | 0.0 | false |
| Abertura | 0.0 | false |
| Encerramento | 0.0 | false |

---

## 3. Backend - Repository e Service de Eventos

### 3.1 `backend/internal/event/repository.go`
- `CreateEvent`: Inserir com `PresenceTypeID`
- `GetByNameAndInitTime`: JOIN com `presence_type_weights` para incluir `type_name` e `weight`
- `GetEvents`: JOIN com `presence_type_weights` para incluir `type_name` e `weight` na listagem
- `UpdateByNameAndInitTime`: Atualizar `PresenceTypeID`

### 3.2 `backend/internal/event/service.go`
- `CreateEvent`: Se `PresenceTypeID != nil`, validar que o peso existe; se `HasAttendance` não foi enviado explicitamente, usar o `default_has_attendance` do tipo
- `UpdateEventByNameAndInitDate`: Mesma lógica de validação
- Manter `GetEvents` e `GetEventByNameAndInitDate` retornando `type` (derivado do join) para compatibilidade

### 3.3 `backend/internal/event/model.go` (struct de resposta)
- Adicionar campo `TypeName string` ao struct `Event` para o join (não persistido):
  ```go
  TypeName string `gorm:"-" json:"type_name"`
  ```

---

## 4. Backend - Migração de Dados

### 4.1 `backend/cmd/api/main.go`
- Após o `AutoMigrate`, adicionar lógica de migração:
  1. Verificar se a coluna `presence_type_weight_id` existe (se não, GORM a adiciona via AutoMigrate)
  2. Para cada evento com `type` preenchido e `presence_type_weight_id` NULL:
     - Buscar `presence_type_weights` onde `LOWER(TRIM(type_name)) = LOWER(TRIM(event.type))`
     - Se encontrar, setar `presence_type_weight_id`
  3. Opcionalmente, fazer DROP da coluna `type` se não houver mais referências

### 4.2 `backend/internal/presencesettings/service.go`
- `InitializeDefaults`: Atualizar para criar todos os 17 tipos (só se a tabela estiver vazia)
- `DeletePresenceTypeWeight`: Adicionar verificação de integridade - buscar se existem eventos com aquele `presence_type_weight_id`, se sim, retornar erro

---

## 5. Backend - Calculadora de Presença

### 5.1 `backend/internal/presencerate/calculator.go`
- `Compute`: Substituir `input.Weights[NormalizeTypeName(e.Type)]` por lookup via `e.PresenceTypeID`
- `loadInput`: Em vez de buildar `weightMap` por string, buildar `weightMap[uint]float64` mapeando `ID -> Weight`
- Para cada evento, buscar o peso pelo `PresenceTypeID` (se não for nil)
- Manter `NormalizeTypeName` para compatibilidade (pode ser removido depois)

### 5.2 `backend/internal/presencerate/calculator_test.go`
- Atualizar testes para usar `PresenceTypeID` em vez de string `Type`
- Criar helper que mapeia nome do tipo para ID fictício para os testes

---

## 6. Backend - Delete Constraint

### 6.1 `backend/internal/presencesettings/service.go`
- `DeletePresenceTypeWeight`: Antes de deletar, contar eventos com aquele `presence_type_weight_id`:
  ```go
  var count int64
  db.Model(&event.Event{}).Where("presence_type_weight_id = ?", weight.ID).Count(&count)
  if count > 0 {
      return error("Não é possível deletar: existem eventos vinculados a este tipo")
  }
  ```

---

## 7. Frontend - Front-backoffice

### 7.1 `front-backoffice/src/types/EventType.ts`
- Adicionar campos:
  ```typescript
  presence_type_weight_id: number | null;
  type_name: string;
  ```

### 7.2 `front-backoffice/src/api/events.ts`
- `mapBackendEvent`: Mapear `presence_type_weight_id` e `type_name`
- `mapToBackendEvent`: Enviar `presence_type_weight_id` em vez de `type`
- `fieldMap`: Atualizar mapeamento

### 7.3 `front-backoffice/src/data/eventsCrudField.ts`
- Trocar o campo `type` de `"text"` para `"select"` com `selectVariants` dinâmico
- Como `CrudField.selectVariants` é estático (Record<string, string>), precisamos de uma abordagem diferente:
  - **Opção A**: Buscar tipos na montagem do componente Events e passar como prop ao CrudTable
  - **Opção B**: Modificar o CrudTable para aceitar `selectVariants` como callback/promise
  - **Opção C**: Criar um componente wrapper para o campo de tipo que busca os tipos e renderiza o dropdown

**Decisão推荐**: Opção A - Buscar tipos na página Events e passar como prop. O CrudTable já suporta `selectVariants` dinâmico se passarmos os valores corretos.

### 7.4 `front-backoffice/src/pages/Events/index.tsx`
- Buscar tipos de evento via `presenceSettingsAPI.getAll()` no `useEffect`
- Montar `selectVariants` dinamicamente a partir dos pesos:
  ```typescript
  const typeVariants = weights.reduce((acc, w) => {
      acc[w.id.toString()] = ""; // ou estilo visual
      return acc;
  }, {} as Record<string, string>)
  ```
- Passar os tipos como opções para o CrudTable
- Quando um tipo é selecionado, auto-preencher `hasPresence` com o `default_has_attendance` do tipo

### 7.5 `front-backoffice/src/components/CrudTable.tsx`
- Possível necessidade de modificar para aceitar:
  - Labels customizados para opções do select (atualmente mostra apenas a chave)
  - Callback quando valor do select muda (para auto-preencher hasPresence)
- Alternativa: Usar `showWhen` ou criar um novo tipo de campo `select-with-side-effect`

---

## 8. Frontend - Front-site

### 8.1 `front-site/src/types/EventType.ts`
- Manter `type: string` (o backend continua retornando o campo `type` derivado do join)
- Nenhuma mudança necessária

### 8.2 `front-site/src/api/events.ts`
- Nenhuma mudança necessária (o `mapBackendEvent` já lê `event.type`)

### 8.3 `front-site/src/lib/constants/EventyTypes.tsx`
- Este arquivo define constantes hardcoded que não são usadas no Cronograma
- Pode ser mantido ou removido (decisão futura)

---

## 9. Ordem de Implementação

1. **Backend models**: Atualizar `presencesettings/model.go` e `event/model.go`
2. **Backend seeds**: Atualizar `presencesettings/service.go` com 17 tipos
3. **Backend delete constraint**: Atualizar `presencesettings/service.go`
4. **Backend repository**: Atualizar `event/repository.go` com JOINs
5. **Backend service**: Atualizar `event/service.go` com validação FK e default has_attendance
6. **Backend calculator**: Atualizar `presencerate/calculator.go` para usar FK
7. **Backend migration**: Adicionar lógica em `main.go`
8. **Backend tests**: Atualizar `presencerate/calculator_test.go`
9. **Frontend types**: Atualizar `front-backoffice/src/types/EventType.ts`
10. **Frontend API**: Atualizar `front-backoffice/src/api/events.ts`
11. **Frontend form**: Atualizar `eventsCrudField.ts` e `pages/Events/index.tsx`
12. **Frontend CrudTable**: Modificar se necessário para dropdown dinâmico

---

## 10. Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `backend/internal/presencesettings/model.go` | Adicionar `DefaultHasAttendance` |
| `backend/internal/presencesettings/service.go` | Seeds de 17 tipos + delete constraint |
| `backend/internal/event/model.go` | FK `PresenceTypeID` + `TypeName` virtual |
| `backend/internal/event/handler.go` | Incluir `type` na resposta via join |
| `backend/internal/event/service.go` | Validação FK + default has_attendance |
| `backend/internal/event/repository.go` | JOINs com `presence_type_weights` |
| `backend/internal/presencerate/calculator.go` | Usar FK em vez de string |
| `backend/internal/presencerate/calculator_test.go` | Atualizar testes |
| `backend/cmd/api/main.go` | Migração de dados |
| `front-backoffice/src/types/EventType.ts` | Adicionar `presence_type_weight_id`, `type_name` |
| `front-backoffice/src/api/events.ts` | Mapear novos campos |
| `front-backoffice/src/data/eventsCrudField.ts` | Tipo como select |
| `front-backoffice/src/pages/Events/index.tsx` | Buscar tipos, montar dropdown |
| `front-backoffice/src/components/CrudTable.tsx` | Possível modificação para select dinâmico |

---

## 11. Verificação

1. **Backend tests**: `cd backend && go test ./internal/presencerate/...`
2. **Backend build**: `cd backend && go build ./cmd/api/`
3. **Frontend build**: `cd front-backoffice && npm run build`
4. **Teste manual**:
   - Criar evento selecionando tipo do dropdown
   - Verificar que `has_attendance` é pré-preenchido
   - Verificar que o tipo aparece corretamente na listagem
   - Tentar deletar tipo com eventos vinculados (deve falhar)
   - Verificar cálculo de presença com os novos tipos
