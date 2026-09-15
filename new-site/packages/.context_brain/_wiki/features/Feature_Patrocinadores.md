---
type: feature-flow
tags: [feature, sponsors, patrocinadores, backoffice, upload, site]
---
# Feature: Patrocinadores

Cadastro de patrocinadores com logo, pacotes por ano e rastreamento de cliques.

---

## Entidades
→ [[Backend_Modelos_Core]] (sponsor em `internal/sponsor/model.go`)

### Sponsor
Tabela: `sponsors` | PK: `CNPJ` (string 14 chars)

| Campo | JSON | Notas |
|---|---|---|
| `CNPJ` PK | `cnpj` | size:14 |
| `Name` | `name` | size:200 |
| `Website` | `website` | size:500 |
| `Logo` | `logo` | path relativo em `/uploads/` |
| `Clicks` | `clicks` | int64, counter de cliques |
| `Packages` | `packages` | `[]SponsorPackage` (cascade) |

### SponsorPackage
PK tripla: `SponsorCNPJ + Year + Package`

| Campo | JSON |
|---|---|
| `SponsorCNPJ` | `sponsor_cnpj` |
| `Year` | `year` |
| `Package` | `package` |

### PublicSponsor (shape público)
`{ cnpj, name, logo, website }` — sem `clicks` (métrica interna não exposta).

---

## Fluxo — Site Público

Página: `front-site/src/pages/Home/sections/PatrocinadoresSection.tsx`

1. `GET /sponsors` → retorna `PublicSponsor[]`
2. Exibe logos dos patrocinadores; clique registra via `POST /sponsors/:cnpj/click`
3. Logos servidas como estático em `/uploads/` pelo backend

API: `front-site/src/api/sponsors.ts` (importado diretamente, não pelo barrel)

---

## Fluxo — Backoffice

Página: `front-backoffice/src/pages/Sponsors/index.tsx`  
Seção: `"Patrocinadores"` | `canWrite = useHasPermission("Patrocinadores", "RW")`

- CRUD de `Sponsor`: criação/edição via multipart form-data (logo como arquivo)
- Gestão de `SponsorPackage` dentro da mesma página (adicionar/remover por ano)
- API: `sponsorsAPI` em `front-backoffice/src/api/sponsors.ts` (no barrel)

---

## Endpoints

### Públicos
| Método | Path | Notas |
|---|---|---|
| GET | `/sponsors` | retorna `PublicSponsor[]` |
| POST | `/sponsors/:cnpj/click` | incrementa `Clicks` |

### Backoffice (`permMW("Patrocinadores", ...)`)
| Método | Path | Handler TS |
|---|---|---|
| GET | `/admin/sponsors` | `sponsorsAPI.getAll(page, ...)` |
| GET | `/admin/sponsors/:cnpj` | `sponsorsAPI.getByCNPJ(cnpj)` |
| POST | `/admin/sponsors` | `sponsorsAPI.create(formData)` |
| PUT | `/admin/sponsors/:cnpj` | `sponsorsAPI.update(cnpj, formData)` |
| DELETE | `/admin/sponsors/:cnpj` | `sponsorsAPI.delete(cnpj)` |
| GET | `/admin/sponsors/:cnpj/packages` | `sponsorsAPI.getPackages(cnpj, year?)` |
| POST | `/admin/sponsors/:cnpj/packages` | `sponsorsAPI.addPackage(cnpj, year, pkg)` |
| DELETE | `/admin/sponsors/:cnpj/packages/:year/:package` | `sponsorsAPI.removePackage(...)` |

→ [[Integracao_API_Backoffice#Patrocinadores]]
