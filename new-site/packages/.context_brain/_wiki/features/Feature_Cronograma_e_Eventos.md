---
type: feature-flow
tags: [feature, eventos, cronograma, listagem, sobreposicao]
---
# Feature: Cronograma e Eventos

Dois contextos: exibição pública (site, `/cronograma`) e gestão (backoffice, `/events`).

---

## Entidade
PK composta: `Name + InitDate` (RFC3339)  
→ [[Backend_Models#Event]]

---

## Fluxo — Cronograma Público (front-site)

Página: `front-site/src/pages/Cronograma/index.tsx`

1. `eventsAPI.getAllEvents()` → `GET /events?limit=1000`  
   - Buscado **direto** de `@/api/events` (não pelo barrel)
   - Guard de página: `pageMW("cronograma")` — 503 se desabilitado
2. Ordena por `dateInit` crescente
3. **Algoritmo de agrupamento por sobreposição**:
   ```
   fimAtual = 0
   para cada evento (ordenado):
     se inicio < fimAtual → mesmo grupo (sobreposição)
     senão → fecha grupo atual, abre novo
     fimAtual = max(fimAtual, fim do evento)
   ```
4. Resultado: `EventType[][]` — grupos renderizados em até 3 colunas (eventos mais longos ficam nas colunas mais à direita)

### Modos de visualização

| Modo | Descrição |
|---|---|
| `"day"` | Um dia por vez; navegação por `DayPill` (seletor de dias) e setas prev/next; padrão ao entrar na página (hoje se dentro do evento, primeiro dia caso contrário) |
| `"week"` | Todos os dias da SEMCOMP lado a lado em scroll horizontal (`EventGroups` com `maxColumns=2`) |

### Componentes principais

| Componente | Responsabilidade |
|---|---|
| `EventButton` | Card clicável por evento; hover expansível (descrição + localização); ícone e cor por tipo; breakpoint de responsividade em 1500px; suporte a `exportMode` |
| `EventTypeIcon` | Ícone Lucide por tipo de evento (`Palestra` → `MicVocal`, `Minicurso/Workshop` → `Rocket`, etc.) |
| `EventModal` | Modal com detalhes completos ao clicar em um evento |
| `DayPill` | Botão de seleção de dia; estados: ativo, hoje (ponto), passado (cinza), futuro |
| `EventGroups` | Renderiza grupos de eventos com 2 ou 3 colunas conforme `maxColumns` |

### Download do cronograma

Função `handleDownloadSchedule` usa `html-to-image` (`toPng`) em uma `<div>` oculta (`position: absolute; left: -9999px`) que contém todos os dias da semana no modo exportação (`exportMode=true`). Gera PNG de 2200px de largura com `pixelRatio: 2`.

### Mapeamento de campos (site)
`mapBackendEvent` em `front-site/src/api/events.ts`:

| Backend | Frontend (`EventType` site) |
|---|---|
| `name` | `name` |
| `init_date` | `dateInit` |
| `end_date` | `dateEnd` |
| `type` | `type` |
| `location` | `location` |
| `description` | `description` |
| `has_attendance` | `has_attendance` |
| `image` | `image` (opcional) |

---

## Fluxo — CRUD de Eventos (backoffice)

Página: `front-backoffice/src/pages/Events/index.tsx`  
Usa `CrudTable` com `canWrite={useHasPermission("Eventos", "RW")}`.

### Mapeamento de campos (backoffice)
`mapBackendEvent / mapToBackendEvent` em `front-backoffice/src/api/events.ts`:

| Backend | Frontend (`EventType` backoffice) |
|---|---|
| `name` | `nameEvent` |
| `init_date` | `dateInit` (RFC3339) |
| `end_date` | `dateEnd` (RFC3339) |
| `location` | `local` |
| `has_attendance` | `hasPresence` |
| `has_signin` | `hasSignin` |
| `max_participants` | `maxParticipants` |

Normalização no envio: `normalizeRFC3339(date)` + `normalizeBoolean(hasPresence)` + `normalizeBoolean(hasSignin)` + `Number(maxParticipants)`

### Campos CRUD no backoffice
`front-backoffice/src/data/eventsCrudField.ts` define os campos exibidos no `CrudTable`:
- `hasSignin` — campo `select` com variantes visuais (azul = true, cinza = false)
- `maxParticipants` — campo `number` (0 = vagas ilimitadas); suportado pelo `CrudTable` via tipo `"number"` adicionado ao componente

### Navegação para QR Code
A partir de `/events` → `/events/:nameEvent/:datetime/qrcode-reader`  
→ [[Feature_Participacao_e_QRCode]]

---

## Endpoints

| Método | Path | Acesso | Função front |
|---|---|---|---|
| GET | `/events` | público | `eventsAPI.getAllEvents` (site) / `eventsAPI.getAll` (backoffice) |
| GET | `/event/:name/:initDate` | público | `eventsAPI.getEventByNameAndDate` / `getByNameAndDate` |
| POST | `/admin/events` | PermRW `"Eventos"` | `eventsAPI.create` |
| PUT | `/admin/events/:name/:initDate` | PermRW `"Eventos"` | `eventsAPI.update` |
| DELETE | `/admin/events/:name/:initDate` | PermRW `"Eventos"` | `eventsAPI.delete` |

Parâmetros de URL são `encodeURIComponent`-ados no frontend.
