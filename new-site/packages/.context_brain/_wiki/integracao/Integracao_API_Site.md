---
type: wiki-integration
tags: [api, integration, site, frontend, axios, rest, endpoints]
---
# Integração API — Front-Site ↔ Backend

Base URL dev: `http://localhost:4000` | prod: `https://semcomp.icmc.usp.br/api`  
Toggle: `front-site/src/constants/ApiURL.tsx` → `VITE_DEBUG_MODE=true` para dev

---

## Cliente Axios (Site)
Arquivo: `front-site/src/api/client.ts`  
Storage key: `semcomp-site-token`

- Request interceptor: injeta `Authorization: Bearer <token>`
- Response interceptor: armazena token renovado se `response.headers.authorization` presente (sem redirect em 401)

---

## Rotas Públicas

| Método | Path | Guard backend | Handler TS |
|---|---|---|---|
| POST | `/register` | `pageMW(login)` | `authAPI.register` |
| POST | `/login` | `pageMW(login)` | `authAPI.login` |
| POST | `/forgot-password` | `pageMW(login)` | — |
| POST | `/reset-password` | `pageMW(login)` | — |
| POST | `/verify-email` | `pageMW(login)` | — |
| POST | `/resend-verification` | `pageMW(login)` | — |
| GET | `/events` | `pageMW(cronograma)` | `eventsAPI.getAllEvents` |
| GET | `/event/:name/:initDate` | `pageMW(cronograma)` | `eventsAPI.getEventByNameAndDate` |
| GET | `/products` | — | `productsAPI.getAllProducts` |
| GET | `/pages/availability` | — | `pagesAPI.getAllAvailability` |
| GET | `/pages/:page/availability` | — | — |
| POST | `/webhook/mercadopago` | — | — (backend only) |

> `pageMW(slug)` = middleware que verifica se a página está disponível no `pages.Service`.

---

## Rotas Site Autenticadas (`/api`, guard: `AuthMiddleware`)

| Método | Path | Handler TS | Notas |
|---|---|---|---|
| GET | `/api/profile` | `authAPI.getProfile` | retorna SafeUser |
| GET | `/api/verify-email?token=` | — | verifica token de email |
| POST | `/api/sales` | `salesAPI.create` | cria venda (PENDENTE) + PIX → [[Feature_Loja_e_Pagamentos]] |
| GET | `/api/sales/profile` | `salesAPI.getMySales` | histórico de compras |
| GET | `/api/sales/consumed` | `salesAPI.getConsumed` | ids de COFFEE/COMBO indisponíveis (consumidos/travados) |
| GET | `/api/sales/:id` | `salesAPI.getById` | detalhes da venda |
| POST | `/api/payments/pix` | `salesAPI.create` | **alias legado** → `CreateSale` |
| GET | `/api/payments/:id/status` | `salesAPI.getStatus` | **alias legado** → `GetSaleStatus` |

**POST `/api/sales` payload**: `{ items: [{ product_id, quantity }], payment_method: "PIX", status?, dietary_restrictions?, description? }`  
**Resposta**: `{ message, sale: { id, user_number, status, total_amount, qr_code, qr_code_base64, pix_expiration, ... } }`

> Compra única: `CreateSale` valida COFFEE/COMBO (quantidade 1 e item não
> consumido/travado); `GET /api/sales/consumed` devolve o conjunto fechado
> (incluindo coffees de combos comprados e combos que contenham coffees
> comprados) para a loja esconder os itens.

---

## API Barrel (Site)
Arquivo: `src/api/index.ts` — exporta: `authAPI`, `client`

Importados diretamente pelas páginas (não pelo barrel):
- `eventsAPI` → `@/api/events`
- `productsAPI` → `@/api/products`
- `salesAPI` → `@/api/sales` (criação de venda, histórico, consumidos, status)
- `pagesAPI` → `@/api/pages`

> `paymentAPI` (`@/api/payment`) ainda existe no barrel, mas `Checkout`/`Cart`
> usam `salesAPI` — o barrel antigo de pagamentos ficou órfão.
