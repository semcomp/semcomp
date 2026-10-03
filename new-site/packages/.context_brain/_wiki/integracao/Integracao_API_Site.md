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
| GET | `/sponsors` | — | `sponsorsAPI.getSponsors` (em `api/sponsors.ts`) |
| POST | `/sponsors/:cnpj/click` | — | `sponsorsAPI.recordClick(cnpj)` |
| POST | `/visit` | — | (chamado na Home) |
| GET | `/stats` | — | (chamado na Home) |
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
| GET | `/api/payments` | — | lista pagamentos do user |
| POST | `/api/payments/pix` | `paymentAPI.createPix` | → [[Feature_Loja_e_Pagamentos]] |
| GET | `/api/payments/:id/status` | `paymentAPI.getStatus` | polling a cada 4s |
| GET | `/api/signin-events` | `signinEventsAPI.getSigninEvents` | lista eventos com `has_signin=true`; retorna chave `events` |
| GET | `/api/signin-events/me` | `signinEventsAPI.getMySignins` | inscrições ativas do usuário; retorna chave `signins` |
| POST | `/api/signin-events` | `signinEventsAPI.createSignin` | body: `{ event_name, event_init_date }` |
| DELETE | `/api/signin-events/:eventName/:eventInitDate` | `signinEventsAPI.deleteSignin` | cancela inscrição |

**POST `/api/payments/pix` payload**: `{ amount: float, product_ids: uint[], description?: string }`  
**Resposta**: `{ payment_id, qr_code, qr_code_base64, amount }`

---

## API Barrel (Site)
Arquivo: `src/api/index.ts` — exporta: `authAPI`, `client`

Importados diretamente pelas páginas (não pelo barrel):
- `eventsAPI` → `@/api/events`
- `productsAPI` → `@/api/products`
- `paymentAPI` → `@/api/payment`
- `pagesAPI` → `@/api/pages`
- `signinEventsAPI` → `@/api/signinEvents` (usado em `pages/Profile`)
- `sponsorsAPI` → `@/api/sponsors` (usado em `pages/Home/sections/PatrocinadoresSection`)
