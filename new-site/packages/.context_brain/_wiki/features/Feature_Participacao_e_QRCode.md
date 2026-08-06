---
type: feature-flow
tags: [feature, presenca, qrcode, camera, participacao, scanner]
---
# Feature: Participação e QR Code

Dois papéis: **participante** (site, exibe QR) ↔ **admin** (backoffice, escaneia e registra presença).

---

## Entidade
PK tripla: `UserNumber + EventName + EventInitDate`  
`EmailAdmin` = email do admin que fez o scan  
→ [[Backend_Models#Presence]]

---

## Papel 1 — Participante exibe QR (front-site / Profile)

| Item | Detalhe |
|---|---|
| Página | `pages/Profile/index.tsx` |
| Dado exibido | `user_number` retornado por `GET /api/profile` |
| Biblioteca | `react-qr-code` |
| Render | `<QRCode value={userCode.toString()} size={180} />` |

> `import.meta.glob` no Profile carrega imagens hero — **não** está relacionado à câmera.

---

## Papel 2 — Admin escaneia QR (front-backoffice / QRCodeReader)

Página: `pages/Events/QRCodeReader/index.tsx`  
Rota: `/events/:nameEvent/:datetime/qrcode-reader`  
Biblioteca: `qr-scanner` — acessa câmera via `<video ref={videoRef}>`  
Parâmetros via `useParams()` + fallback de `location.state`

### Fluxo de Scan
```
Admin abre QRCodeReader
  └─ startScanner() → new QrScanner(videoRef, handleDecode, { preferredCamera: "environment", maxScansPerSecond: 30 })
       └─ QR lido → handleDecode(scanResult)
            └─ userNumber = scanResult.data.trim()
                 └─ scannerRef.current.pause(true)
                      └─ registerPresence(userNumber)
                           └─ participationAPI.createByQRCode(userNumber, eventName, datetime, user.email)
                                └─ POST /admin/presences
```

### `participationAPI.createByQRCode`
Arquivo: `front-backoffice/src/api/participation.ts`  
**Não é endpoint separado** — monta `ParticipationType` e chama `POST /admin/presences`:
```ts
createByQRCode(userNumber, eventName, eventInitDate, adminEmail) {
  const presence = { user_number: userNumber, name_event: eventName,
                     date_event: eventInitDate, user_backoffice: adminEmail }
  payload = mapFrontendPresence(presence)  // normaliza RFC3339 + int
  return client.post("/admin/presences", payload)
}
```
- `adminEmail` = `user?.email` do `AuthContext` backoffice
- Sucesso → modal com `userCode` escaneado
- Erro → `showNotification(error, "warning")`
- Botão "Escanear novamente" → `scannerRef.current.start()`

---

## Mapeamento de Campos (Presença)
`front-backoffice/src/api/participation.ts`:

| Frontend | Backend JSON |
|---|---|
| `user_number` / `userNumber` | `user_number` |
| `name_event` / `nameEvent` | `event_name` |
| `date_event` / `dateEvent` | `event_init_date` |
| `user_backoffice` | `email_admin` |

---

## Endpoints

| Método | Path | Acesso |
|---|---|---|
| POST | `/admin/presences` | PermRW `"Participações"` |
| GET | `/admin/presences` | PermR `"Participações"` |
| GET | `/admin/presences/:u/:e/:d` | PermR `"Participações"` |
| PUT | `/admin/presences/:u/:e/:d` | PermRW `"Participações"` |
| DELETE | `/admin/presences/:u/:e/:d` | PermRW `"Participações"` |

---

## Referências
- Perfil (exibe QR): [[Site_Paginas_e_Rotas#Profile]]
- Navegação (backoffice): [[Feature_Cronograma_e_Eventos]]
- Auth do admin (fornece `email`): [[Feature_Autenticacao_e_Sessoes#Fluxo_Backoffice]]
