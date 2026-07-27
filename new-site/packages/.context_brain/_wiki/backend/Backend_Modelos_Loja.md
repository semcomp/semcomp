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
| `Kit` | `ID` uint FK→Product | `Name size:200`, `Size size:50`, `Color size:50`, `IsBabydoll bool` |
| `Coffee` | `ID` uint FK→Product | `Name size:200`, `DateTime timestamptz` |
| `ComboItem` | PK composta `ComboID + ItemID` | FK→Products, CASCADE |

**Tipos**: `ProductType = "KIT" | "COFFEE" | "COMBO"`

Relações em `Product`:
- `Kit *Kit` — preload via FK:ID CASCADE
- `Coffee *Coffee` — preload via FK:ID CASCADE
- `ComboItems []ComboItem` — preload via FK:ComboID CASCADE

---

## Payment
Tabela: `payments` | Relacionamento: `payment_products` (many2many)

| Campo | Tipo | Notas |
|---|---|---|
| `ID_Payment` PK | uint auto | |
| `UserNumber` | uint | not null, index |
| `MercadoPagoID` | *string | size:100, uniqueIndex, nullable |
| `Status` | string | `pending \| approved \| rejected \| refunded` (DB check) |
| `Amount` | float64 | |
| `Products` | `[]Product` | many2many:payment_products |

---

## DTOs de Pagamento

**Criar PIX** (`POST /api/payments/pix`):
```
{ amount float64 (required,gt=0), description string, product_ids []uint }
```

**Resposta**:
```
{ payment_id uint, qr_code string, qr_code_base64 string, amount float64 }
```

**Webhook Payload** (`POST /webhook/mercadopago`):
```
{ action string, data: { id string } }   // "id" também aceito via query param
```

---

## Structs Detalhadas
→ Ver [[_raw/Backend_Models]] para Go structs completas com tags GORM
