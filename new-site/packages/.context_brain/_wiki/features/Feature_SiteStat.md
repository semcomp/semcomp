---
type: feature-flow
tags: [feature, sitestat, analytics, visitas, contador]
---
# Feature: SiteStat (Contador de Visitas)

Contador genérico key/value para rastrear métricas do site (atualmente: visitas).

---

## Entidade
Tabela: `site_stats` | Arquivo: `internal/sitestat/model.go`

```go
type SiteStat struct {
    Key   string `gorm:"primaryKey;size:100"`
    Value int64  `gorm:"not null;default:0"`
}
```

---

## Endpoints

| Método | Path | Notas |
|---|---|---|
| POST | `/visit` | incrementa o contador `"visits"` |
| GET | `/stats` | retorna todos os pares `{ key, value }` |

Ambas as rotas são públicas (sem autenticação).

---

## Uso no Frontend

Chamado pela página Home (`front-site/src/pages/Home/index.tsx`) no mount:
- `POST /visit` — registra cada visita única à Home
- `GET /stats` — exibe números na `NumerosSection`

Sem UI de gerenciamento — não há rota de backoffice para esta feature.

---

## Invariantes

- Não há suporte a múltiplos contadores distintos além de `"visits"` — o modelo é genérico mas o uso atual é só esse
- Sem autenticação ou rate-limiting nas rotas — vulnerável a contagem inflada por bots
