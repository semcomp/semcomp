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
- [[Backend_Arquitetura]] — módulos, camadas, startup, grupos de rota (inclui signinEvent em construção)
- [[Backend_Modelos_Core]] — User (todos os campos), Event (+ has_signin, max_participants), SigninEvent, Presence, Section, AuditLog, JWT Claims, ListQuery
- [[Backend_Modelos_Loja]] — Product (KIT/COFFEE/COMBO), Payment, DTOs de PIX
- [[Backend_Providers]] — JWT (2 fluxos), bcrypt, email, token

## Frontend — Site Público (`front-site`)
- [[Site_Paginas_e_Rotas]] — rotas, lazy loading, FeatureGuard, RequireAuth
- [[Site_Contextos_Auth]] — AuthContext, API client, API barrel
- [[Site_Contextos_UI]] — ThemeContext, NotificationContext, FeatureFlagsContext, CartContext

## Frontend — Backoffice (`front-backoffice`)
- [[Backoffice_Paginas_e_Rotas]] — rotas /admin/*, guards duplos (auth + permissão)
- [[Backoffice_Contextos_e_Lib]] — AuthContext admin, RequirePermission, Tabs (6), CrudTable, API barrel

## Integração
- [[Integracao_API_Site]] — endpoints públicos e /api/* (site), axios client
- [[Integracao_API_Backoffice]] — endpoints /admin/* (backoffice), mapeamento de campos

## Features Verticais
- [[Feature_Autenticacao_e_Sessoes]] — dois fluxos JWT, login, sessão, localStorage
- [[Feature_Email_e_Tokens]] — verificação de email, reset de senha, módulo token, mailer SMTP
- [[Feature_Controle_Backend]] — RBAC: 7 KnownSections, middleware Go, validações do handler
- [[Feature_Controle_Frontend]] — guards de rota, filtragem UI, matrix de permissões, refresh
- [[Feature_Cronograma_e_Eventos]] — cronograma público (agrupamento), CRUD backoffice
- [[Feature_Participacao_e_QRCode]] — scan via câmera (backoffice), QR exibido no Profile (site)
- [[Feature_Loja_e_Pagamentos]] — produtos (KIT/COFFEE/COMBO), carrinho, checkout PIX, polling, webhook
- [[Feature_Flags_e_Pages]] — feature toggle via API, FeatureGuard, backoffice toggle UI

---

## ⚠ Gaps Conhecidos
- **Backoffice**: `"Produtos"` existe como `KnownSection` no backend (com CRUD em `/admin/products`) mas **não há página de gerenciamento no front-backoffice** — a seção existe apenas para controle de permissão futura
- **Cart**: `CartContext` é in-memory apenas — itens são perdidos ao recarregar a página
- **Payments**: sem operação atômica — se `createPix` falhar após criar o pagamento no MP, o status fica inconsistente
- **Permissions (bulk)**: salvar permissões faz N chamadas paralelas com `Promise.all`; falha parcial deixa estado inconsistente sem rollback
- **Sections**: a tab `sections` foi removida do backoffice — seções deixaram de ser gerenciáveis via UI (mas endpoint backend ainda existe)
- **Feature Flags**: estado das flags vive **em memória no processo Go** — reiniciar o servidor reseta todas as flags para `available: true`
- **SigninEvent**: módulo `internal/signinEvent` tem model e repository implementados (tabela `signin_events` criada), mas service e handler estão vazios — **sem endpoints HTTP**; `has_signin` e `max_participants` existem no model de Event mas a lógica de inscrição ainda não está exposta pela API
