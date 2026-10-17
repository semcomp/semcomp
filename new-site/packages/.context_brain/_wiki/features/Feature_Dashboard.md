---
type: feature-flow
tags: [feature, dashboard, backoffice, analytics, sales, kits]
---
# Feature: Dashboard de Dados (Backoffice)

Painel agregado de métricas da Semcomp (participantes, presença, kits, coffees, combos e vendas).  
Seção RBAC: `"Dashboard"` (somente leitura) → [[Feature_Controle_Backend]]  
Endpoint: `GET /admin/dashboard` → [[Integracao_API_Backoffice#Dashboard]]  
Rotas front: `/dashboard`, `/dashboard/presence` → [[Backoffice_Paginas_e_Rotas]]

---

## Backend — módulo `dashboardbackoffice`
Pasta: `backend/internal/dashboardbackoffice/` (handler/service/repository/model; sem tabela própria — só leitura via SQL cru sobre as tabelas de outros módulos)

- `GET /admin/dashboard?sections=users,events,kits,coffees,combos,sales` — `permMW("Dashboard", PermR)`; sem `sections` retorna todas
- `DashboardService.GetDashboard` chama o repositório por seção pedida; `sales` também anexa `GetTopProducts()` em `SalesOverviewStats.TopProducts`
- Todas as métricas de venda consideram apenas `sales.status = 'PAGO'` (exceto contadores de pendentes/status)

| Seção | Método do repositório | Struct de resposta |
|---|---|---|
| `users` | `GetUsersStats` | `UsersStats` |
| `events` | `GetEventsStats` | `EventsSummary` (`EventStats[]`) |
| `kits` | `GetKitSalesStats` | `KitSalesStats` — por cor, tamanho, corte e cruzamento (`KitVariantStat`); inclui kits vendidos dentro de combos via `sale_items.kit_product_id` |
| `coffees` | `GetCoffeeSalesStats` | `CoffeeSalesStats` — inclui coffees de combos via `combo_items` |
| `combos` | `GetComboSalesStats` | `ComboSalesStats` |
| `sales` | `GetSalesOverview` + `GetTopProducts` | `SalesOverviewStats` + `ProductRank[]` |

### Ranking de produtos (`GetTopProducts` → `ProductRank`)
Agrupa por produto **e por variante de camiseta**:
- KIT avulso → a variante é o próprio kit (`kits.id = products.id`)
- COMBO → a variante é a camiseta escolhida (`sale_items.kit_product_id`); vendas de combo sem `kit_product_id` caem no único KIT do combo (CTE `single_kit_combos`, só quando o combo tem exatamente 1 KIT)
- COFFEE → campos de variante nulos

| Campo JSON | Origem |
|---|---|
| `productId`, `name`, `type` | `products` (nome cai para `kits.name`/`coffees.name`/tipo se vazio) |
| `kitProductId`, `size`, `color`, `isBabylook` | `kits` da variante (omitidos quando nulos) |
| `sold`, `revenue` | `SUM(quantity)`, `SUM(unit_price * quantity)` |

---

## Frontend — `front-backoffice`
- API: `dashboardAPI.get(params?)` em `src/api/dashboard.ts` (tipos espelham os structs Go)
- Página: `pages/Dashboard/index.tsx` — um único fetch, grid de cards:

| Card | Arquivo | Dados |
|---|---|---|
| Overview de participantes | `components/OverviewCard.tsx` | `users` |
| Vendas de kits | `components/KitsCard.tsx` | `kits` — filtros de corte (todos/babylook/tradicional) e eixo cor ↔ tamanho |
| Coffes vendidos | `components/CoffeesCard.tsx` | `coffees` |
| Presença em eventos | `components/PresenceCard.tsx` | `events` — botão para `/dashboard/presence` |
| Compras e produtos | `components/ProductsCard.tsx` | `sales` — ranking "Mais vendidos" / "Maior valor"; cada linha mostra badge do tipo + badge da variante (`tamanho · cor · Babylook/Tradicional`); chave `productId-kitProductId`; textos quebram linha dentro do card |

- `pages/Dashboard/presence.tsx` — análise detalhada de presença por dia/evento (recharts), usa `components/presenceUtils.ts`

---

## Referências
- Modelos de loja (Product/Kit/ComboItem/SaleItem): [[Backend_Modelos_Loja]]
- Fluxo de vendas e `kit_product_id` obrigatório em combos com camiseta: [[Feature_Loja_e_Pagamentos]]
- Seed de dados (combos sem `kit_product_id`): [[Feature_Seed]]
