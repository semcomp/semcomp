---
type: feature-flow
tags: [feature, eventos, cronograma, listagem, paginacao, sobreposicao]
---
# Funcionalidade: Cronograma e Eventos

Dois contextos de consumo: exibição pública (site) e gestão (backoffice).

---

## Entidade Central

Struct: [[Backend_Models#Event]]  
**PK composta**: `Name (string) + InitDate (timestamptz)`  
Campos relevantes para display: `name`, `init_date`, `end_date`, `type`, `location`, `description`, `has_attendance`

---

## Padrão ListQuery / ListResult

Todos os endpoints de listagem seguem o mesmo padrão — [[Backend_Models#Queries_de_Listagem]]:

Query params aceitos: `page, limit, sort_by, sort_order, search_by, search_value`  
Resposta envelopa: `{ page, limit, total_records, filtered_records, <entidades>[] }`

---

## Fluxo — Cronograma Público (front-site)

| Etapa | Detalhe |
|---|---|
| Página | `front-site/pages/Cronograma/index.tsx` |
| API call | `eventsAPI.getAllEvents()` → `GET /events?limit=1000` |
| Motivo do limit=1000 | Busca todos de uma vez para algoritmo de agrupamento local (sem paginação no cronograma) |
| Arquivo | `front-site/src/api/events.ts` — importado diretamente (não pelo barrel) |

### Algoritmo de Agrupamento por Sobreposição
Executado no cliente após fetch. Entrada: lista já ordenada por `dateInit`:

```
fimAtual = 0
para cada evento:
  se inicio < fimAtual → mesmo grupo (sobreposição)
  senão → fecha grupo atual, abre novo grupo
  fimAtual = max(fimAtual, fim do evento)
```

Resultado: `EventType[][]` — grupos renderizados em colunas lado a lado.

### Mapeamento de campos (site)
`front-site/src/api/events.ts → mapBackendEvent`:

| Backend | Frontend (`EventType` site) |
|---|---|
| `name` | `name` |
| `init_date` | `dateInit` |
| `end_date` | `dateEnd` |
| `location` | `location` |
| `has_attendance` | `has_attendance` |

---

## Fluxo — CRUD de Eventos (backoffice)

| Etapa | Detalhe |
|---|---|
| Página | `front-backoffice/pages/Events/index.tsx` |
| API | `eventsAPI` de `front-backoffice/src/api/events.ts` (export no barrel) |
| Listagem | `eventsAPI.getAll(page, limit, sortBy, sortOrder, searchBy?, searchValue?)` |

### Mapeamento de campos (backoffice)
`front-backoffice/src/api/events.ts → mapBackendEvent / mapToBackendEvent`:

| Backend | Frontend (`EventType` backoffice) |
|---|---|
| `name` | `nameEvent` |
| `init_date` | `dateInit` (RFC3339) |
| `end_date` | `dateEnd` (RFC3339) |
| `location` | `local` |
| `has_attendance` | `hasPresence` |

Normalização aplicada no envio: `normalizeRFC3339(date)` + `normalizeBoolean(hasPresence)`

### Navegação para QR Code
A partir de `/events`, o admin navega para `/events/:nameEvent/:datetime/qrcode-reader`  
→ Ver [[Feature_Participacao_e_QRCode]] para o fluxo de leitura

---

## Endpoints mapeados

| Método | Path | Acesso | Função front |
|---|---|---|---|
| GET | `/events` | público | `eventsAPI.getAllEvents` (site) / `eventsAPI.getAll` (backoffice) |
| GET | `/event/:name/:initDate` | público | `eventsAPI.getEventByNameAndDate` / `getByNameAndDate` |
| POST | `/admin/events` | backoffice | `eventsAPI.create` |
| PUT | `/admin/events/:name/:initDate` | backoffice | `eventsAPI.update` |
| DELETE | `/admin/events/:name/:initDate` | backoffice | `eventsAPI.delete` |

→ Tabela completa: [[Integracao_API#Events_Backoffice]]

---

## Referências
- Entidade: [[Backend_Models#Event]]
- Handler: [[Backend_Arquitetura#event]]
- Páginas: [[Front_Paginas_e_Rotas#Cronograma]], [[Front_Paginas_e_Rotas#front-backoffice]]
- Presença em evento: [[Feature_Participacao_e_QRCode]]
