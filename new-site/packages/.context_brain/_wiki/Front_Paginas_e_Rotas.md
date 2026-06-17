---
type: wiki-frontend
tags: [frontend, pages, routes, react, vite]
---
# Frontend — Páginas e Rotas

---

## front-site (`packages/front-site/`)
Porta dev: **5173** | Router: React Router v6 (lazy loading via `createBrowserRouter`)

| Path | Componente | Guard | API consumida |
|---|---|---|---|
| `/` | `pages/Home/index.tsx` | — | `constants/Sponsors.ts` (estático) |
| `/cronograma` | `pages/Cronograma/index.tsx` | — | `eventsAPI.getAllEvents` (direto, não pelo barrel) |
| `/login` | `pages/Login/index.tsx` | — | [[Integracao_API#POST_login]] via `AuthContext.login` |
| `/profile` | `pages/Profile/index.tsx` | `RequireAuth` | [[Integracao_API#GET_api_profile]] + `eventsAPI` |
| `*` | `pages/NotFound/index.tsx` | — | — |

### Home (`/`) — Estrutura da Página
Arquivo: `pages/Home/index.tsx`  
Renderiza `<MainEntrance>` (componente de entrada com arrow bounce) seguido das seções abaixo:

| Ordem | Componente | Conteúdo |
|---|---|---|
| 1 | `MainEntrance` (componente, não seção) | Hero principal com animação de arrow bounce |
| 2 | `sections/SobreSection.tsx` | Texto sobre a Semcomp |
| 3 | `sections/PatrocinadoresSection.tsx` | Logos de patrocinadores (via `constants/Sponsors.ts`) |
| 4 | `sections/EquipeSection.tsx` | Membros da equipe organizadora |
| 5 | `sections/FAQSection.tsx` | Perguntas frequentes |
| 6 | `sections/ContatoSection.tsx` | Formulário/contato (reutilizado também na página Profile) |

Background alterna com `isDarkMode` via [[Front_Hooks_e_Estados#ThemeContext]].

### Cronograma (`/cronograma`) — Lógica Relevante
Arquivo: `pages/Cronograma/index.tsx`  
1. Busca todos os eventos via `eventsAPI.getAllEvents` (limit=1000)
2. Ordena por `dateInit` (crescente)
3. **Agrupa eventos sobrepostos**: se `inicio < fimDoGrupoAtual` → mesmo grupo; caso contrário, fecha grupo e abre novo
4. Renderiza grupos em colunas (multi-coluna se houver sobreposição)
5. Usa `formatTime` de `src/lib/utils/formatDate`

### Profile (`/profile`) — Lógica Relevante
Arquivo: `pages/Profile/index.tsx`  
Guard: `RequireAuth` (redireciona para `/login` se não autenticado)  
1. Chama `authAPI.getProfile()` → `GET /api/profile` → retorna dados do usuário
2. Carrega eventos estáticos locais com `linkInscricao` (array hardcoded no componente — não vem do backend)
3. **Gera QR Code** via `react-qr-code` para cada evento (exibe user_number ou código)
4. Usa imagens hero aleatórias via `import.meta.glob` em `src/assets/img/Home/Hero/*.webp`
5. Reutiliza `<ContatoSection>` no rodapé da página

### Estado Global (site)
- [[Front_Hooks_e_Estados#AuthContext_Site]] — autenticação do participante
- [[Front_Hooks_e_Estados#ThemeContext]] — dark/light mode (default: dark)
- [[Front_Hooks_e_Estados#NotificationContext]] — toasts de feedback
- [[Front_Hooks_e_Estados#useWindowDimensions]] — responsividade

---

## front-backoffice (`packages/front-backoffice/`)
Porta dev: **5174** | `basename: "/admin"` | Router: React Router v6 (static imports)

| Path (relativo a `/admin`) | Componente | Guard | API consumida | Integração |
|---|---|---|---|---|
| `/login` | `pages/Login/index.tsx` | — | [[Integracao_API#POST_admin_login]] | ✅ |
| `/home` | `pages/Home/index.tsx` | `RequireAuth` | — (só navegação) | ✅ |
| `/sections` | `pages/Section/index.tsx` | `RequireAuth` | [[Integracao_API#Sections_Backoffice]] | ✅ |
| `/events` | `pages/Events/index.tsx` | `RequireAuth` | [[Integracao_API#Events_Backoffice]] | ✅ |
| `/events/:nameEvent/:datetime/qrcode-reader` | `pages/Events/QRCodeReader/index.tsx` | `RequireAuth` | [[Integracao_API#POST_admin_presences]] | ✅ |
| `/semcomp-users` | `pages/UserSemcomp/index.tsx` | `RequireAuth` | [[Integracao_API#Users_Backoffice]] | ✅ |
| `/backoffice-users` | `pages/UserBackoffice/index.tsx` | `RequireAuth` | [[Integracao_API#UsersBackoffice_Backoffice]] | ✅ |
| `/participation` | `pages/Participation/index.tsx` | `RequireAuth` | [[Integracao_API#Presences_Backoffice]] | ✅ |
| `/permissions` | `pages/Permission/index.tsx` | `RequireAuth` | ⚠️ mock (`samplePermissions`) | ❌ TODO |
| `*` | `pages/NotFound/index.tsx` | `RequireAuth` | — | — |

### Home do Backoffice (`/home`) — Tabs de Navegação
Arquivo: `pages/Home/index.tsx` + `constants/Tabs.ts`  
Exibe cards clicáveis, um por Tab, que navegam para cada CRUD:

| Tab key | Label | Rota |
|---|---|---|
| `sections` | Seções | `/sections` |
| `events` | Eventos | `/events` |
| `backoffice-users` | Usuários Backoffice | `/backoffice-users` |
| `users-semcomp` | Usuários Semcomp | `/semcomp-users` |
| `participation` | Participações | `/participation` |
| `permissions` | Permissões | `/permissions` |

Saudação dinâmica: `Bom dia/Boa tarde/Boa noite, {user.name.split(" ")[0]}`

### Estado Global (backoffice)
- [[Front_Hooks_e_Estados#AuthContext_Backoffice]] — autenticação do admin
- [[Front_Hooks_e_Estados#NotificationContext]] — toasts
→ Ver [[Backoffice_Contextos_e_Lib]] para RequireAuth e API barrel
