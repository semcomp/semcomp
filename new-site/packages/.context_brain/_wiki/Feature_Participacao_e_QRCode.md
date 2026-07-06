---
type: feature-flow
tags: [feature, presenca, qrcode, camera, participacao, scanner]
---
# Funcionalidade: Participação e QR Code

Fluxo em dois papéis: **participante** (site, exibe QR) ↔ **admin** (backoffice, escaneia e registra presença).

---

## Entidade Central

Struct: [[Backend_Models#Presence]]  
**PK tripla**: `UserNumber + EventName + EventInitDate`  
Quem registra: `EmailAdmin` (email do admin que fez o scan)

---

## Papel 1 — Participante exibe QR Code (front-site / Profile)

| Item | Detalhe |
|---|---|
| Página | `front-site/pages/Profile/index.tsx` (rota `/profile`, guard `RequireAuth`) |
| Dado exibido | `userCode` = `user_number` numérico retornado por `authAPI.getProfile()` → `GET /api/profile` |
| Biblioteca | `react-qr-code` — `<QRCode value={userCode.toString()} size={180} />` |
| Abas do Profile | `"qr"` (mostra QR Code + código numérico) e `"account"` (dados pessoais) |
| Estado inicial | `activeTab = "qr"` |

### `import.meta.glob` no Profile — uso correto
**NÃO** é para câmera. Carrega as imagens hero de forma dinâmica:
```ts
import.meta.glob("/src/assets/img/Home/Hero/*", { eager: true })
```
Seleciona uma imagem `.webp` aleatória a cada montagem do componente.  
→ Ver contexto completo em [[Front_Paginas_e_Rotas#Profile]]

---

## Papel 2 — Admin escaneia QR Code (front-backoffice / QRCodeReader)

| Item | Detalhe |
|---|---|
| Página | `front-backoffice/pages/Events/QRCodeReader/index.tsx` |
| Rota | `/events/:nameEvent/:datetime/qrcode-reader` (guard `RequireAuth`) |
| Biblioteca | `qr-scanner` (não `react-qr-code`) — acessa câmera via `<video ref={videoRef}>` |
| Parâmetros | `nameEvent` e `datetime` via `useParams()` + fallback de `location.state` |

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
**Não** é um endpoint separado — monta um `ParticipationType` e chama `POST /admin/presences` internamente:

```ts
createByQRCode(userNumber, eventName, eventInitDate, adminEmail) {
  const presence = { user_number: userNumber, name_event: eventName,
                     date_event: eventInitDate, user_backoffice: adminEmail }
  payload = mapFrontendPresence(presence)  // normaliza RFC3339 + int
  return client.post("/admin/presences", payload)
}
```

- `adminEmail` = `user?.email` do [[Front_Hooks_e_Estados#AuthContext_Backoffice]]
- Sucesso → `setShowSuccessPopup(true)` exibe modal com `userCode` lido
- Erro → `setError(backendMessage)` → `useEffect` dispara `showNotification(error, "warning")`
- Botão "Escanear novamente" → `scannerRef.current.start()` retoma câmera

---

## `userSemcompAPI` — API correta para usuários Semcomp

O nome de export correto é **`userSemcompAPI`** (arquivo `api/users.ts`), não `usersAPI`.  
Usado na página `UserSemcomp/index.tsx` para CRUD de participantes.

**Por que importa**: ao referenciar ou criar código que liste/busque participantes no backoffice, usar o nome errado (`usersAPI`) causa erro de importação silencioso ou `undefined`.

| Export correto | Arquivo | Endpoints |
|---|---|---|
| `userSemcompAPI` | `front-backoffice/src/api/users.ts` | CRUD `/admin/users` (participantes Semcomp) |
| `userBackofficeAPI` | `front-backoffice/src/api/userBackoffice.ts` | CRUD `/admin/usersBackoffice` (admins) |

→ Ver barrel: [[Backoffice_Contextos_e_Lib#API_Barrel]]

---

## Endpoints de Presença

| Método | Path | Função front |
|---|---|---|
| POST | `/admin/presences` | `participationAPI.create` / `participationAPI.createByQRCode` |
| GET | `/admin/presences` | `participationAPI.getAll` |
| GET | `/admin/presences/:u/:e/:d` | `participationAPI.getByKeys` |
| PUT | `/admin/presences/:u/:e/:d` | `participationAPI.update` |
| DELETE | `/admin/presences/:u/:e/:d` | `participationAPI.delete` |

→ Tabela completa: [[Integracao_API#Presences_Backoffice]]

---

## Referências
- Entidade: [[Backend_Models#Presence]], [[Backend_Models#User]], [[Backend_Models#Event]]
- Handler: [[Backend_Arquitetura#presence]]
- Profile (QR exibido): [[Front_Paginas_e_Rotas#Profile]]
- Eventos (navegação para QRCodeReader): [[Feature_Cronograma_e_Eventos]]
- Autenticação do admin (fornece `email` para `EmailAdmin`): [[Feature_Autenticacao_e_Sessoes#Fluxo_Backoffice]]
