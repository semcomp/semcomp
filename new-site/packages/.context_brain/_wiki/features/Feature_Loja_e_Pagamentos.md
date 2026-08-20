---
type: feature-flow
tags: [feature, loja, store, payment, pix, mercadopago, produtos, carrinho]
---
# Feature: Loja e Pagamentos

Fluxo completo: catálogo público → carrinho (in-memory) → checkout PIX (Mercado Pago).  
Rotas do site: `/loja`, `/loja/carrinho`, `/loja/checkout`, `/loja/pagamentos` — todas requerem login + feature flag `"loja"`.

---

## Produtos

### Hierarquia de Tipos
Backend: `internal/product/model.go`  
Frontend: `src/types/ProductType.ts`

| Tipo | Especialização | Campos extras |
|---|---|---|
| `KIT` | `Kit` | name, size, color, is_babylook |
| `COFFEE` | `Coffee` | name, date_time (ISO) |
| `COMBO` | `ComboItem[]` | combo_id + item_id |

Campo `is_selling: bool` — apenas produtos com `true` são exibidos na loja.  
Campo `picture_url` — URL da imagem (fallback: placehold.co).

### Fetch de Produtos
`productsAPI.getAllProducts()` → `GET /products?limit=1000`  
Filtra localmente: `selling.filter(p => p.is_selling)`.  
Para COMBOs: `collectComboDateTimes()` extrai horários dos COFFEEs filhos (busca no map por `item_id`).

**Compra única**: a loja também exclui os produtos de compra única já consumidos
ou travados pelo usuário. `salesAPI.getConsumed()` → `GET /api/sales/consumed`
devolve o conjunto fechado (ids de COFFEE/COMBO indisponíveis); o filtro final é
`p.is_selling && !consumedSet.has(p.id)`. *Fail-open*: se o fetch falhar, a loja
mostra todos normalmente.

---

## Carrinho (CartContext)

Estado in-memory — **perdido ao recarregar**.

**cartKey**: `"${id}_${size}_${dateTime}_${isBabylook}"` — garante unicidade por variante.  
`addItem()` increments quantity se cartKey já existe.  
`updateQuantity(cartKey, -1)` remove item se qty cai para 0.  
**Quantidade máxima**: `COFFEE` e `COMBO` são compra única → `maxQuantity = 1`
(pelo carrinho); `KIT` não tem teto. O stepper de combo da loja também trava em 1.

→ [[Site_Contextos#CartContext]]

---

## Fluxo de Checkout

```
/loja/carrinho (CartPage)
  └─ "Finalizar Pedido" → salesAPI.create({ items, payment_method: "PIX", dietary_restrictions })
       └─ POST /api/sales → backend valida compra única, cria venda PENDENTE
            e gera o PIX (QR code + copia-e-cola) → retorna SaleResponse
       └─ erro de validação (item já consumido/reservado) → mostra a mensagem do backend
  └─ navigate("/loja/checkout", { state: { sale, dietaryRestrictions } })

/loja/checkout (CheckoutPage)
  └─ exibe QR code (img base64) + código copia-e-cola via `<PixQrCard>`
  └─ countdown: baseado em pix_expiration (30 min) — interno do PixQrCard
  └─ SSE: EventSource `/api/sales/:id/events` (substitui polling)
       └─ "PAGO" → clearCart() + tela de sucesso
       └─ "REJEITADO" / "CANCELADO" / "REEMBOLSADO" → tela de erro
       └─ "EXPIRADO" → tela de expiração
  └─ Ao aprovar, apenas limpa o carrinho; o status vira PAGO via webhook do Mercado Pago
     (ou edição manual no backoffice em dev)

/loja/pagamentos (PendingPaymentsPage)
  └─ busca histórico: `salesAPI.getMySales()` → `GET /api/sales/profile`
  └─ filtra pendentes via helper compartilhado `isPendingSale()` (src/lib/pendingSale.ts):
     `status === "PENDENTE"` E `qr_code` presente E `(pix_expiration ?? created_at+30min) > now`
     (venda sem QR não é pagável → não entra na lista)
  └─ lista expansível (acordeão); item expandido renderiza `<PixQrCard>` com SSE
  └─ SSE por venda expandida (uma conexão por vez; fechada ao colapsar/desmontar)
       └─ "PAGO" → notificação de sucesso + remove da lista
       └─ "EXPIRADO" / "REJEITADO" / "CANCELADO" / "REEMBOLSADO" → remove da lista + notificação
  └─ acesso: botão "Ver pagamentos pendentes (N)" na aba Compras do Profile E banner
     na loja (StorePage) — ambos usam o mesmo `isPendingSale()` e só aparecem com
     a flag `loja` ativa
```

> **Venda criada no "Finalizar Pedido"**: o backend persiste a venda (status
> `PENDENTE`) e devolve o PIX na resposta de criação — não há um endpoint
> separado de "criar pagamento". O QR (copia-e-cola + base64) também é
> persistido (`qr_code`/`qr_code_base64`) para permitir reabrir pendentes. O
> front acompanha o status por SSE em `GET /api/sales/:id/events`.
>
> `<PixQrCard>` mostra um estado de aviso ("Pagamento não gerado. Refazer o
> pedido.") quando `qr_code`/`qr_code_base64` vêm vazios, em vez de spinner
> infinito + botão copiar desabilitado.

---

## Compra Única (consumido)

COFFEE e COMBO são **compra única por usuário**: só podem ser comprados 1 vez,
quantidade 1. Kits NÃO entram (não são consumidos e não propagam).

### Trava no banco — `consumed_items`
Tabela N:M usuário↔produto com **chave composta** `(user_number, product_id)` e
campo `source_sale_id` (a venda que originou a trava). Inserida **na mesma
transação** da criação do pedido (`CreateWithConsumed`) e removida quando o
pedido expira, é cancelado, reembolsado ou excluído.

- `PENDENTE` (PIX) e `PAGO` → mantêm as travas.
- Status final (`EXPIRADO`, `CANCELADO`, `REEMBOLSADO`, `REJEITADO`) → destrava
  (`syncConsumptionForSale` chamado no webhook, `UpdateSaleByID`, `DeleteSaleByID`).
- **Anti-race**: a unicidade da chave composta + `ON CONFLICT DO NOTHING` faz o
  2º pedido concorrente do mesmo item ser rejeitado (transação revertida, 400).

### Fechamento do conjunto indisponível (`getUnavailableProductIDs`)
1. base = ids já consumidos/travados do usuário;
2. repete até fixar: combo consumido → coffees **dentro** dele ficam
   indisponíveis; coffee consumido → **todo combo que o contenha** some;
3. kits nunca entram.

Esse conjunto é o que o `CreateSale` usa para rejeitar compras duplicadas e o
que `GET /api/sales/consumed` devolve para a loja esconder os produtos.

### Expiração real no banco (sweeper)
Antes, `EXPIRADO` era só calculado em memória (`EffectiveStatus`). Agora um
sweeper goroutine no `main.go` roda a cada 1 min, persiste `EXPIRADO` nos PIX
pendentes fora da janela (`UPDATE ... RETURNING`, atômico) e libera as travas
das vendas expiradas.

---

## Backend — Pagamento PIX (módulo sales)

Arquivo: `internal/sales/` (o antigo `internal/payment` foi absorvido)

| Endpoint | Acesso | Descrição |
|---|---|---|
| `POST /api/sales` | AuthMiddleware + `pageMW("loja")` | Cria venda PENDENTE + PIX no MP; persiste `qr_code`/`qr_code_base64` |
| `GET /api/sales/profile` | AuthMiddleware + `pageMW("loja")` | Histórico de compras do usuário |
| `GET /api/sales/:id/status` | AuthMiddleware + `pageMW("loja")` | Status efetivo da venda (polling legado; hoje sem uso no front) |
| `GET /api/sales/:id/events` | AuthMiddleware + `pageMW("loja")` | SSE de status PIX — usado por Checkout e PendingPayments |
| `POST /webhook/mercadopago` | público | Recebe notificação do MP (`salesHandler.Webhook`) |

Após `createPixCharge` (real ou mock), o serviço chama
`SaleRepository.SetPixQRCode(id, qrCode, qrCodeBase64)` para persistir o QR na
venda. Em dev, `MERCADOPAGO_MOCK=true` faz o `createPixCharge` pular o HTTP e
preencher um QR dummy (`MOCK-PIX-SEMCOMP-<id>` + PNG placeholder) — **mock
temporário, não é produção**.

### Webhook Mercado Pago
- Aceita `data.id` via query param **ou** body JSON `{ action, data: { id } }`
- Valida `x-signature` e `x-request-id` headers
- Sempre responde 200 para o MP não reenviar (inclusive em erros já tratados)
- Ao atualizar o status, roda `syncConsumptionForSale` (PAGO re-trava; status final destrava)

### Status da Venda
DB constraint `status_chk`: `status IN ('PENDENTE','PAGO','REJEITADO','CANCELADO','REEMBOLSADO','EXPIRADO')`
(`EXPIRADO` é persistido pelo sweeper; `EffectiveStatus` ainda o calcula em memória).

---

## Limitações Conhecidas

- **Carrinho in-memory**: itens são perdidos ao recarregar. Não há persistência em localStorage.
- **Reload no checkout**: se o usuário recarrega `/loja/checkout` sem `sale` no location.state e o carrinho não está vazio, o sistema recria a venda (POST /api/sales). Se o carrinho foi limpo (pós-aprovação), redireciona para `/loja/carrinho`.
- **Validação de compra única, sem estoque de KIT**: o backend rejeita compra duplicada de COFFEE/COMBO (quantidade 1, itens travados por pedido ativo), mas não controla estoque de KIT — kits podem ser comprados em qualquer quantidade.
- **KITs não são consumidos**: a trava de compra única cobre apenas COFFEE e COMBO, por definição da regra de negócio.

---

## Referências
- Modelos: [[Backend_Models#Product]], [[Backend_Models#Payment]] | [[Backend_Modelos_Loja]]
- Backend módulos: [[Backend_Arquitetura#product]], [[Backend_Arquitetura#payment]], [[Backend_Arquitetura#sales]]
- Endpoints: [[Integracao_API_Site]]
- CartContext: [[Site_Contextos#CartContext]]
- Feature flag da loja: [[Feature_Flags_e_Pages]]
