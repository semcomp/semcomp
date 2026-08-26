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
- [[Backend_Arquitetura]] — módulos, camadas, startup, grupos de rota
- [[Backend_Modelos_Core]] — User (todos os campos), Event, Presence, Section, AuditLog, JWT Claims, ListQuery
- [[Backend_Modelos_Loja]] — Product (KIT/COFFEE/COMBO), Sale (PIX), ConsumedItem (compra única), DTOs
- [[Backend_Providers]] — JWT (2 fluxos), bcrypt, email, token

## Frontend — Site Público (`front-site`)
- [[Site_Paginas_e_Rotas]] — rotas, lazy loading, FeatureGuard, RequireAuth
- [[Site_Contextos_Auth]] — AuthContext, API client, API barrel
- [[Site_Contextos_UI]] — ThemeContext, NotificationContext, FeatureFlagsContext, CartContext

## Frontend — Backoffice (`front-backoffice`)
- [[Backoffice_Paginas_e_Rotas]] — rotas /admin/*, guards duplos (auth + permissão)
- [[Backoffice_Contextos_e_Lib]] — AuthContext admin, RequirePermission, Tabs (9), CrudTable (expansão de linha), API barrel

## Integração
- [[Integracao_API_Site]] — endpoints públicos e /api/* (site), axios client
- [[Integracao_API_Backoffice]] — endpoints /admin/* (backoffice), mapeamento de campos

## Features Verticais
- [[Feature_Autenticacao_e_Sessoes]] — dois fluxos JWT, login, sessão, localStorage
- [[Feature_Email_e_Tokens]] — verificação de email, reset de senha, módulo token, mailer SMTP
- [[Feature_Controle_Backend]] — RBAC: 9 KnownSections, middleware Go, validações do handler
- [[Feature_Controle_Frontend]] — guards de rota, filtragem UI, matrix de permissões, refresh
- [[Feature_Cronograma_e_Eventos]] — cronograma público (agrupamento), CRUD backoffice
- [[Feature_Participacao_e_QRCode]] — scan via câmera (backoffice), QR exibido no Profile (site)
- [[Feature_Loja_e_Pagamentos]] — produtos (KIT/COFFEE/COMBO), carrinho, checkout PIX, SSE, pagamentos pendentes, webhook, compra única (consumido)
- [[Feature_Flags_e_Pages]] — feature toggle via API, FeatureGuard, backoffice toggle UI

---

## ⚠ Gaps Conhecidos
- **Sales (status)**: `salesAPI.getStatus` (`GET /api/sales/:id/status`) é código morto no front — o checkout e os pagamentos pendentes usam SSE (`GET /api/sales/:id/events`). O endpoint de status permanece disponível para uso externo/polling.
- **Payments (PIX)**: a venda é persistida **antes** de disparar a cobrança no Mercado Pago — se `createPixCharge` falhar, sobra uma venda `PENDENTE` sem QR code (status inconsistente até expirar).
- **Cart**: `CartContext` é in-memory apenas — itens são perdidos ao recarregar a página
- **Permissions (bulk)**: salvar permissões faz N chamadas paralelas com `Promise.all`; falha parcial deixa estado inconsistente sem rollback
- **Sections**: a tab `sections` foi removida do backoffice — seções deixaram de ser gerenciáveis via UI (mas endpoint backend ainda existe)
- **Feature Flags**: estado das flags vive **em memória no processo Go** — reiniciar o servidor reseta todas as flags para `available: true`
