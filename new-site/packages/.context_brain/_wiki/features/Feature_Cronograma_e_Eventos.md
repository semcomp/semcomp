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
4. Resultado: `EventType[][]` — grupos renderizados em colunas lado a lado

### Mapeamento de campos (site)
`mapBackendEvent` em `front-site/src/api/events.ts`:

| Backend | Frontend (`EventType` site) |
|---|---|
| `name` | `name` |
| `init_date` | `dateInit` |
| `end_date` | `dateEnd` |
| `location` | `location` |
| `has_attendance` | `has_attendance` |

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
