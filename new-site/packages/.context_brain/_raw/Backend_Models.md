---
type: raw-models
tags: [backend, models, golang, gorm, database, dto]
---
# Backend — Structs Completas e DTOs

→ Variáveis de ambiente: [[Backend_Envs]]  
→ Wiki de entidades core: [[Backend_Modelos_Core]]  
→ Wiki de entidades loja: [[Backend_Modelos_Loja]]  
→ Controle de acesso (Permission): [[Feature_Controle_Backend]]  
→ Tokens de email: [[Feature_Email_e_Tokens]]

---

## User
Arquivo: `internal/user/model.go` | Tabela: `users`

```go
type User struct {
    UserNumber    uint      // PK, not null
    Name          string    // size:100, not null
    Email         string    // size:150, unique, not null
    PasswordHash  string    // size:255, not null (não exposto)
    Age           int       // not null
    Gender        string    // size:50, not null
    City          string    // size:100, not null
    Education     string    // size:100, not null
    HasPapfe      bool      // not null
    Disabilities  string    // type:text, default:""
    Profession    *string   // size:120, nullable
    Linkedin      *string   // size:255, nullable
    Telegram      *string   // size:255, nullable
    PresenceRate  float64   // not null

    // Verificação de email (campos inline no User)
    EmailVerified              bool       // not null, default:false
    VerificationTokenHash      string     // size:255
    VerificationTokenExpiresAt *time.Time // nullable
    VerificationSentAt         *time.Time // nullable
    VerificationWindowStartAt  *time.Time // nullable
    VerificationSendCount      int        // not null, default:0
}
```

**SafeUser** (exposto pela API): `user_number(string,%05d)`, `name`, `email`, `age`, `gender`, `city`, `education`, `hasPapfe`, `disabilities`, `profession?`, `linkedin?`, `telegram?`, `presence_rate`, `email_verified`

### PapfeDocument
Tabela: `papfe_documents` — comprovante PAPFE do participante (arquivo binário).

```go
type PapfeDocument struct {
    ID          uint      // PK auto
    UserEmail   string    // size:150, uniqueIndex, FK → users.Email ON DELETE CASCADE
    Filename    string    // size:255
    ContentType string    // size:100
    Data        []byte    // type:bytea
    UploadedAt  time.Time
}
```

### DTOs do User
```go
type CreateUserRequest struct {
    Name         string   // required
    Email        string   // required, email
    Password     string   // required, min=8
    Age          int      // required, gt=0
    Gender       string   // required
    City         string   // required
    Education    string   // required
    HasPapfe     bool
    Disabilities string
    Profession   *string
    Linkedin     *string
    Telegram     *string
    // Papfe: preenchido pelo handler via multipart — não vai no JSON
}

type UpdateUserRequest struct {
    Name / Email / Age / Gender / City / Education / HasPapfe / Disabilities / Profession / Linkedin / Telegram
    // mesmos campos, todos required exceto os nullable
}

type ForgotPasswordRequest  { Email string // required, email }
type ResetPasswordRequest   { Token string // required; NewPassword string // required, min=8 }
type VerifyEmailRequest     { Token string // required }
type ResendVerificationRequest { Email string // required, email }
```

---

## UserBackoffice
Tabela: `users_backoffice` (TableName explícito)

```go
type UserBackoffice struct {
    Email        string  // PK, size:150
    PasswordHash string  // size:255 (não exposto)
}
// SafeUserB: { Email }

type CreateUserBackofficeRequest { Email string // required,email; Password string // required,min=8 }
type UpdateUserBackofficeRequest { Email string // required,email; Password string // required,min=8 }
```

---

## Event
Tabela: `events` | PK composta: `Name + InitDate`

```go
type Event struct {
    Name          string    // PK, size:200
    InitDate      time.Time // PK, timestamptz
    EndDate       time.Time // timestamptz, not null
    Type          string    // size:50
    Location      string
    Description   string    // type:text
    HasAttendance bool
}
// CreateEventRequest / UpdateEventRequest: mesmos campos; Name+InitDate+EndDate required
```

---

## Presence
Tabela: `presences` | PK tripla: `UserNumber + EventName + EventInitDate`

```go
type Presence struct {
    UserNumber    int64     // PK
    EventName     string    // PK, size:200
    EventInitDate time.Time // PK, timestamptz
    EmailAdmin    string    // size:255, not null
}
// CreatePresenceRequest / UpdatePresenceRequest: todos os campos required
// UserNumber: binding:"required,gt=0"
// EmailAdmin: binding:"required,email,max=255"
```

---

## Section
Tabela: `sections`

```go
type Section struct {
    Name        string  // PK, size:200
    Description string  // type:text
}
// CreateSectionRequest / UpdateSectionRequest: Name required,max=200; Description opcional
```

---

## Permission
Tabela: `permissions` | PK composta: `UserEmail + SectionName`

```go
type Permission struct {
    UserEmail      string   // PK, size:150
    SectionName    string   // PK, size:200
    PermissionType *string  // size:2; nil=sem acesso, "R"=read, "RW"=read-write
    User    *UserBackoffice  // FK:UserEmail (preload)
}

type PermissionRequest struct {
    UserEmail      string  // required, max=150
    SectionName    string  // required, max=200
    PermissionType *string // omitempty, max=2
}
```

KnownSections (7): `"Eventos"`, `"Usuários Backoffice"`, `"Usuários Semcomp"`, `"Participações"`, `"Permissões"`, `"Produtos"`, `"Páginas"`

---

## Product (hierarquia)
Tabelas: `products`, `kits`, `coffees`, `combo_items`

```go
type Product struct {
    ID         uint        // PK auto
    Type       ProductType // "KIT" | "COFFEE" | "COMBO"
    IsSelling  bool
    Price      float64
    PictureURL string      // size:255
    Kit        *Kit        // FK:ID, CASCADE
    Coffee     *Coffee     // FK:ID, CASCADE
    ComboItems []ComboItem // FK:ComboID, CASCADE
}

type Kit    { ID uint PK; Name string size:200; Size string size:50; Color string size:50; IsBabydoll bool }
type Coffee { ID uint PK; Name string size:200; DateTime time.Time timestamptz }
type ComboItem { ComboID uint PK; ItemID uint PK }

type CreateProductRequest struct {
    Type      ProductType // required, oneof=KIT COFFEE COMBO
    IsSelling bool
    Price     float64     // required, gt=0
    Kit       *CreateKitRequest    // omitempty
    Coffee    *CreateCoffeeRequest // omitempty
    Items     []uint               // IDs dos filhos, para COMBO
}
// UpdateProductRequest: mesmos campos
```

---

## Payment
Tabela: `payments`

```go
type Payment struct {
    ID_Payment    uint              // PK auto
    UserNumber    uint              // not null, index
    MercadoPagoID *string          // size:100, uniqueIndex, nullable
    Status        string           // pending|approved|rejected|refunded (DB check)
    Amount        float64
    Products      []product.Product // many2many:payment_products
}

type CreatePixRequest struct {
    Amount      float64 // required, gt=0
    Description string
    ProductIDs  []uint  // json:"product_ids"
}

type PixPaymentResponse struct {
    PaymentID    uint    // json:"payment_id"
    QRCode       string  // json:"qr_code"
    QRCodeBase64 string  // json:"qr_code_base64"
    Amount       float64
}

type WebhookPayload struct {
    Action string
    Data   struct { ID string } // json:"data.id" também aceito via query param
}
```

---

## Token
Tabela: `tokens`

```go
type Token struct {
    ID        uint      // PK auto
    UserID    uint      // not null, index:idx_user_type
    TokenHash string    // size:64, SHA-256 do token plain, não exposto
    Type      TokenType // "email_verification" | "password_reset"
    ExpiresAt time.Time
    UsedAt    *time.Time // nullable; não-nulo = já consumido
}
```

> Geração: `token.GenerateToken()` → retorna `(plain, hash, err)`. Plain vai no email, hash vai no banco.

---

## AuditLog
Tabela: `audit_logs`

```go
type AuditLog struct {
    ID         uint      // PK auto
    CreatedAt  time.Time // autoCreateTime
    UserNumber *uint     // nullable
    UserEmail  *string   // nullable
    StatusCode int
    Message    string    // type:text
    Method     string
    Path       string
    LatencyMs  int64
}
```

---

## JWT Claims

```go
// Site — gerado por jwtProvider.Generate(userID, email)
type AuthTokenClaims struct {
    UserNumber uint   // payload "id"
    Email      string // payload "sub"
}

// Backoffice — gerado por jwtProvider.GenerateToBackoffice(email)
type AuthBackofficeTokenClaims struct {
    Email string // payload "sub"
}
```

Algoritmo: HS256 | TTL: `JWT_EXPIRES_IN_HOURS` (default 24h) | Secret: `JWT_SECRET`

---

## Padrão ListQuery / ListResult (compartilhado)

Todos os módulos com listagem aceitam via query string:
`page`, `limit`, `sort_by`, `sort_order`, `search_by`, `search_value`

Resposta envelopa: `{ page, limit, total_records, filtered_records, <entidades>[] }`
