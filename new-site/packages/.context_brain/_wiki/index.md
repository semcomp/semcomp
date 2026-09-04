---
type: moc
tags: [index, moc, semcomp, monorepo]
---
# Semcomp — Map of Content

Vault raiz: `semcomp/new-site/packages/`  
Ponto de entrada do grafo — todo nó do projeto conecta-se aqui.

---

## Visão Macro
- [[Visao_Geral]] — monorepo, tecnologias, portas, fluxos JWT, DEBUGMODE

---

## Backend
- [[Backend_Arquitetura]] — módulos, camadas, startup, grupos de rota (17 módulos: auth, signinEvent, sponsor, sitestat, etc.)
- [[Backend_Modelos_Core]] — User (+ quer_cracha, autoriza_compartilhamento), Event, SigninEvent (completo), PapfeDocument, Presence, Section, AuditLog, JWT Claims, ListQuery
- [[Backend_Modelos_Loja]] — Product (KIT/COFFEE/COMBO), Payment, DTOs de PIX
- [[Backend_Providers]] — JWT (2 fluxos), bcrypt, email, token

## Frontend — Site Público (`front-site`)
- [[Site_Paginas_e_Rotas]] — rotas (layout `App` estático + páginas lazy), FeatureGuard, RequireAuth
- [[Site_Contextos_Auth]] — AuthContext, API client, API barrel
- [[Site_Contextos_UI]] — ThemeContext, NotificationContext, FeatureFlagsContext, CartContext

## Frontend — Backoffice (`front-backoffice`)
- [[Backoffice_Paginas_e_Rotas]] — rotas /admin/*, guards duplos (auth + permissão), 9 rotas (+ Sponsors, PAPFE)
- [[Backoffice_Contextos_e_Lib]] — AuthContext admin, RequirePermission, Tabs (8), CrudTable, API barrel

## Integração
- [[Integracao_API_Site]] — endpoints públicos e /api/* (site), axios client
- [[Integracao_API_Backoffice]] — endpoints /admin/* (backoffice), mapeamento de campos

## Features Verticais
- [[Feature_Autenticacao_e_Sessoes]] — dois fluxos JWT, login, sessão, localStorage
- [[Feature_Email_e_Tokens]] — verificação de email, reset de senha, módulo token, mailer SMTP
- [[Feature_Controle_Backend]] — RBAC: 10 KnownSections, middleware Go, validações do handler
- [[Feature_Controle_Frontend]] — guards de rota, filtragem UI, matrix de permissões, refresh
- [[Feature_Cronograma_e_Eventos]] — cronograma público (agrupamento), CRUD backoffice
- [[Feature_SigninEvent]] — inscrição em eventos com fila de espera, Profile page, admin CRUD
- [[Feature_Participacao_e_QRCode]] — scan via câmera (backoffice), QR exibido no Profile (site)
- [[Feature_Loja_e_Pagamentos]] — produtos (KIT/COFFEE/COMBO), carrinho, checkout PIX, polling, webhook
- [[Feature_Flags_e_Pages]] — feature toggle via API, FeatureGuard, backoffice toggle UI
- [[Feature_Patrocinadores]] — Sponsor + SponsorPackage, CRUD backoffice, GET público, click tracking
- [[Feature_PAPFE]] — upload de comprovante, revisão tri-state, aprovação backoffice
- [[Feature_SiteStat]] — contador de visitas key/value, POST /visit, GET /stats

---

## ⚠ Gaps Conhecidos
- **Backoffice**: `"Produtos"` e `"Inscrições"` existem como `KnownSection` no backend (com CRUD em `/admin/products` e `/admin/signin-events`) mas **não há página de gerenciamento no front-backoffice**
- **Cart**: `CartContext` é in-memory apenas — itens são perdidos ao recarregar a página
- **Payments**: sem operação atômica — se `createPix` falhar após criar o pagamento no MP, o status fica inconsistente
- **Permissions (bulk)**: salvar permissões faz N chamadas paralelas com `Promise.all`; falha parcial deixa estado inconsistente sem rollback
- **Sections**: a tab `sections` foi removida do backoffice — seções deixaram de ser gerenciáveis via UI (mas endpoint backend ainda existe)
- **Feature Flags**: estado das flags vive **em memória no processo Go** — reiniciar o servidor reseta todas as flags para `available: true`
- **SiteStat**: sem rate-limiting em `POST /visit` — contador vulnerável a inflação por bots
