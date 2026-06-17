---
type: moc
tags: [index, moc, semcomp, monorepo]
---
# Semcomp — Map of Content

Vault raiz: `semcomp/new-site/packages/`  
Ponto de entrada do grafo — todo nó do projeto conecta-se aqui.

---

## Visão Macro
- [[Visao_Geral]] — monorepo, tecnologias, portas, DEBUGMODE, convenções

## Backend (Go + Gin + GORM)
- [[Backend_Arquitetura]] — 10 módulos internos, camadas, grupos de rota, startup
- [[Backend_Models]] — todas as structs/entidades, campos, PKs e FKs *(raw)*

## Frontend — Site Público (`front-site`)
- [[Front_Paginas_e_Rotas]] — 5 rotas, seções da Home, lógica do Cronograma, Profile+QR
- [[Front_Hooks_e_Estados]] — AuthContext, ThemeContext, NotificationContext *(raw)*

## Frontend — Backoffice (`front-backoffice`)
- [[Backoffice_Contextos_e_Lib]] — AuthContext admin, RequireAuth, Tabs (6 seções), API barrel
- [[Front_Paginas_e_Rotas]] — 8 rotas admin com guard, 6 CRUDs
- [[Front_Hooks_e_Estados]] — AuthContext_Backoffice *(raw)*

## Integração
- [[Integracao_API]] — todos os endpoints mapeados, mapeamento de campos, estado de integração

## Features Verticais
- [[Feature_Autenticacao_e_Sessoes]] — dois fluxos JWT, claims, erros, sessão
- [[Feature_Controle_de_Acesso_e_Permissions]] — RBAC, seeds de seções, validação de FK, mock no front
- [[Feature_Cronograma_e_Eventos]] — limit=1000, agrupamento por sobreposição, ListQuery/ListResult
- [[Feature_Participacao_e_QRCode]] — câmera no backoffice, QR exibido no Profile, createByQRCode, userSemcompAPI

---

## ⚠ Integrações Pendentes (TODOs no código)
- `front-backoffice/pages/Permission/index.tsx` — usa **mock local** (`samplePermissions`), backend não é chamado
- Não existe `permissionsAPI` no barrel `front-backoffice/src/api/index.ts`
