---
type: wiki-models
tags: [backend, models, golang, gorm, produto, pagamento, loja]
---
# Backend — Modelos Loja

Entidades do módulo de vendas: catálogo de produtos e pagamentos PIX.  
→ Fluxo completo: [[Feature_Loja_e_Pagamentos]]  
→ Endpoints: [[Integracao_API_Site]]

---

## Product (hierarquia)
Tabelas: `products`, `kits`, `coffees`, `combo_items`

| Struct | PK | Campos principais |
|---|---|---|
| `Product` | `ID` uint auto | `Type`, `IsSelling bool`, `Price float64`, `PictureURL string` |
| `Kit` | `ID` uint FK→Product | `Name size:200`, `Size size:50`, `Color size:50`, `IsBabylook bool` |
| `Coffee` | `ID` uint FK→Product | `Name size:200`, `DateTime timestamptz` |
| `ComboItem` | PK composta `ComboID + ItemID` | FK→Products, CASCADE |

**Tipos**: `ProductType = "KIT" | "COFFEE" | "COMBO"`

Relações em `Product`:
- `Kit *Kit` — preload via FK:ID CASCADE
- `Coffee *Coffee` — preload via FK:ID CASCADE
- `ComboItems []ComboItem` — preload via FK:ComboID CASCADE

---

## Sale (venda e pagamento PIX)
Tabela: `sales` | Módulo: `internal/sales`  
A antiga tabela `payments` (e o pacote `internal/payment`) **não existe mais** —
a cobrança PIX virou campo da própria venda.

| Campo | Tipo | Notas |
|---|---|---|
| `ID` PK | uint auto | |
| `SaleUserNumber` | uint | not null, index |
| `Status` | SaleStatus | `PENDENTE \| PAGO \| REJEITADO \| CANCELADO \| REEMBOLSADO \| EXPIRADO` (check `status_chk`) |
| `TotalAmount` | float64 | not null |
| `PaymentMethod` | string | `"PIX"` etc. |
| `MercadoPagoID` | *string | size:100, uniqueIndex — id do pagamento no MP |
| `QRCode` | string | `type:text` — copia-e-cola PIX (persistido p/ reabrir pendente) |
| `QRCodeBase64` | string | `type:text` — imagem QR PIX em base64 (persistido) |
| `DietaryRestrictions` | string | size:1000 — só para vendas com COFFEE |
| `User` | *user.User | FK `SaleUserNumber` |
| `Items` | `[]SaleItem` | FK `SaleID`, CASCADE |

Campos transitórios (não persistidos): `PixExpiration` (preenchido na resposta de
criação PIX; o front usa a janela padrão de 30min quando o campo vem vazio).
Flags calculadas: `HasKitItems`, `HasCoffeeItems` (via `ComputeItemFlags()`).

### SaleItem
| Campo | Tipo | Notas |
|---|---|---|
| `ID` PK | uint auto | |
| `SaleID` | uint | FK→Sale, CASCADE |
| `ProductID` | uint | FK→Product |
| `Quantity` | int | |
| `UnitPrice` | float64 | |
| `IsPickedUp` | bool | controle de retirada (backoffice) |

---

## ConsumedItem (trava de compra única)
Tabela: `consumed_items` | Módulo: `internal/sales`  
Relaciona usuário ↔ produto de compra única (COFFEE/COMBO) já consumido ou
travado por um pedido ativo. Chave composta — a unicidade serve de trava
anti-race para pedidos concorrentes do mesmo item.

| Campo | Tipo | Notas |
|---|---|---|
| `UserNumber` | uint | `primaryKey` — parte da chave composta |
| `ProductID` | uint | `primaryKey` — parte da chave composta |
| `SourceSaleID` | uint | `not null, index` — venda que originou a trava (usado p/ destravar) |
| `CreatedAt` | time.Time | `autoCreateTime` |
| `Product` | `*product.Product` | `foreignKey:ProductID` (preload) |

Ciclo de vida:
- Inserido **na mesma transação** da criação do pedido (`CreateWithConsumed`,
  `ON CONFLICT DO NOTHING` + `RowsAffected==0` → rollback/rejeição).
- Removido quando a venda expira (sweeper), é cancelada, reembolsada ou excluída
  (`DeleteConsumedBySale`).
- `syncConsumptionForSale` reforça (PENDENTE/PAGO) ou libera (status final) de
  forma idempotente em cada mudança de status.

---

## DTOs de Venda e PIX

**Criar venda + PIX** (`POST /api/sales`; alias legado `POST /api/payments/pix`):
```
{
  items: [{ product_id uint (required), quantity int (required,min=1) }],
  payment_method: string (required,max=50),       // "PIX"
  status?: "PENDENTE"|"PAGO"|"REJEITADO"|"CANCELADO"|"REEMBOLSADO",  // default PENDENTE
  dietary_restrictions?: string (max=1000),
  description?: string (max=255)                   // descrição da cobrança no MP
}
```

**Resposta de criação** (quando `payment_method = "PIX"`):
```
{ message string, sale: { id, user_number, status: "PENDENTE", total_amount,
                          payment_method, qr_code, qr_code_base64, pix_expiration, ... } }
```

> `qr_code`/`qr_code_base64` são persistidos na venda — também vêm em
> `GET /api/sales/profile` e `GET /api/sales/:id`. `pix_expiration` é
> transitório (só na resposta de criação); o front usa `created_at + 30min`
> como fallback ao reabrir vendas do histórico.

**Webhook Payload** (`POST /webhook/mercadopago`):
```
{ action string, data: { id string } }   // "id" também aceito via query param
```

---

## Structs Detalhadas
→ Ver [[_raw/Backend_Models]] para Go structs completas com tags GORM
