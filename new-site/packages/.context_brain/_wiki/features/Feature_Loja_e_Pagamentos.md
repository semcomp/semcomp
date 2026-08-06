---
type: feature-flow
tags: [feature, loja, store, payment, pix, mercadopago, produtos, carrinho]
---
# Feature: Loja e Pagamentos

Fluxo completo: catálogo público → carrinho (in-memory) → checkout PIX (Mercado Pago).  
Rotas do site: `/loja`, `/loja/carrinho`, `/loja/checkout` — todas requerem login + feature flag `"loja"`.

---

## Produtos

### Hierarquia de Tipos
Backend: `internal/product/model.go`  
Frontend: `src/types/ProductType.ts`

| Tipo | Especialização | Campos extras |
|---|---|---|
| `KIT` | `Kit` | name, size, color, is_babydoll |
| `COFFEE` | `Coffee` | name, date_time (ISO) |
| `COMBO` | `ComboItem[]` | combo_id + item_id |

Campo `is_selling: bool` — apenas produtos com `true` são exibidos na loja.  
Campo `picture_url` — URL da imagem (fallback: placehold.co).

### Fetch de Produtos
`productsAPI.getAllProducts()` → `GET /products?limit=1000`  
Filtra localmente: `selling.filter(p => p.is_selling)`.  
Para COMBOs: `collectComboDateTimes()` extrai horários dos COFFEEs filhos (busca no map por `item_id`).

---

## Carrinho (CartContext)

Estado in-memory — **perdido ao recarregar**.

**cartKey**: `"${id}_${size}_${dateTime}_${isBabydoll}"` — garante unicidade por variante.  
`addItem()` increments quantity se cartKey já existe.  
`updateQuantity(cartKey, -1)` remove item se qty cai para 0.

→ [[Site_Contextos#CartContext]]

---

## Fluxo de Checkout

```
/loja/carrinho (CartPage)
  └─ "Finalizar Pedido" → paymentAPI.createPix(subtotal, productIds, description)
       └─ POST /api/payments/pix { amount, product_ids, description }
            └─ backend cria pagamento no Mercado Pago → retorna QR code
            └─ resposta: { payment_id, qr_code, qr_code_base64, amount }
  └─ navigate("/loja/checkout", { state: { pixData } })

/loja/checkout (CheckoutPage)
  └─ exibe QR code (img base64) + código copia-e-cola
  └─ countdown: 30 minutos (PIX_TIMEOUT_SECONDS = 1800)
  └─ polling: GET /api/payments/:id/status a cada 4 segundos (POLL_INTERVAL_MS = 4000)
       └─ "approved" → clearCart() + tela de sucesso
       └─ "rejected" / "refunded" → tela de erro
       └─ timeout → status "expired"
  └─ Se sem pixData (reload de página): tenta recriar PIX; se subtotal=0 → redirect /loja/carrinho
```

---

## Backend — Payment

Arquivo: `internal/payment/`

| Endpoint | Acesso | Descrição |
|---|---|---|
| `POST /api/payments/pix` | AuthMiddleware + `pageMW("loja")` | Cria PIX no Mercado Pago |
| `GET /api/payments` | AuthMiddleware | Lista pagamentos do usuário logado |
| `GET /api/payments/:id/status` | AuthMiddleware + `pageMW("loja")` | Polling de status |
| `POST /webhook/mercadopago` | público | Recebe notificação do MP |

### Webhook Mercado Pago
- Aceita `data.id` via query param **ou** body JSON `{ action, data: { id } }`
- Valida `x-signature` e `x-request-id` headers
- Sempre responde 200 para o MP não reenviar (inclusive em erros já tratados)

### Status do Payment
DB constraint: `status IN ('pending', 'approved', 'rejected', 'refunded')`

---

## Limitações Conhecidas

- **Carrinho in-memory**: itens são perdidos ao recarregar. Não há persistência em localStorage.
- **Reload no checkout**: se o usuário recarrega `/loja/checkout` sem pixData no location.state, o sistema tenta criar novo PIX. Se o carrinho foi limpo (pós-aprovação), redireciona para `/loja/carrinho`.
- **Sem validação de estoque**: o backend não controla estoque — múltiplas compras do mesmo produto são permitidas.
- **productIds no PIX**: o frontend envia um Set deduplicado de IDs — se o usuário adiciona 3 unidades do mesmo produto, apenas 1 ID vai na requisição.

---

## Referências
- Modelos: [[Backend_Models#Product]], [[Backend_Models#Payment]]
- Backend módulos: [[Backend_Arquitetura#product]], [[Backend_Arquitetura#payment]]
- CartContext: [[Site_Contextos#CartContext]]
- Feature flag da loja: [[Feature_Flags_e_Pages]]
