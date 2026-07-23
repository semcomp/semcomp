---
type: raw-frontend
tags: [frontend, typescript, types, models, backoffice, site]
---
# Front — TypeScript Types

→ Modelos backend correspondentes: [[Backend_Modelos_Core]] e [[Backend_Modelos_Loja]]  
→ Fluxo de pagamento: [[Feature_Loja_e_Pagamentos]]

---

## Types — Backoffice

| Arquivo | Tipo | Campos |
|---|---|---|
| `types/APIResponseType.ts` | `BackofficePermission` | `user_email: string`, `section_name: string`, `permission_type: "R" \| "RW"` |
| `types/APIResponseType.ts` | `PageAvailability` | `page: string`, `available: boolean` |
| `api/events.ts` | `EventType` | `nameEvent`, `dateInit`, `dateEnd`, `local`, `type`, `description`, `hasPresence` |
| `api/participation.ts` | `ParticipationType` | `user_number`, `name_event`, `date_event`, `user_backoffice` |
| `data/eventsCrudField.ts` | `CrudField[]` | definição das colunas da CrudTable de eventos |

---

## Types — Site

| Arquivo | Tipo | Campos |
|---|---|---|
| `types/UserType.ts` | `UserType` (SafeUser) | `user_number(string)`, `name`, `email`, `age`, `gender`, `city`, `education`, `hasPapfe`, `disabilities`, `profession?`, `linkedin?`, `telegram?`, `presence_rate`, `email_verified` |
| `types/ProductType.ts` | `Product` | `id`, `type: ProductType`, `is_selling`, `price`, `picture_url`, `kit?`, `coffee?`, `combo_items?` |
| `types/ProductType.ts` | `ProductType` | `"KIT" \| "COFFEE" \| "COMBO"` |
| `types/FeatureKeyType.ts` | `FeatureKey` | `"home" \| "login" \| "cronograma" \| "profile" \| "riddle" \| "loja"` |
| `api/payment.ts` | `PixPaymentResponse` | `payment_id: number`, `qr_code: string`, `qr_code_base64: string`, `amount: number` |

---

## Mapeamento TS → Backend (Eventos)

O frontend usa nomes diferentes do backend para campos de evento:

| TypeScript (`EventType`) | Backend (`Event`) |
|---|---|
| `nameEvent` | `name` |
| `dateInit` | `init_date` |
| `dateEnd` | `end_date` |
| `local` | `location` |
| `hasPresence` | `has_attendance` |

> Mapeamento feito manualmente nos handlers de API — não há serialização automática.
