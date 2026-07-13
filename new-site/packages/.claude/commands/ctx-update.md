---
description: Atualiza o vault .context_brain após uma feature ser completada. Analisa o git diff, reconstrói o subgrafo afetado e sincroniza cada nó com a realidade atual do código.
---

Uma feature foi completada. Analise o que mudou no código, identifique os nós do grafo `.context_brain/_wiki/` afetados e atualize-os para refletir o estado real.

---

## Passo 1 — Entender o diff

Execute e analise:
```bash
git diff main...HEAD --stat
git diff main...HEAD
```

Se `$ARGUMENTS` foi fornecido, use como hint de área — mas confirme pelo diff real.

Agrupe os arquivos alterados por camada:
- **Backend**: `backend/internal/<módulo>/`, `backend/cmd/api/main.go`
- **Frontend backoffice**: `front-backoffice/src/`
- **Frontend site**: `front-site/src/`

---

## Passo 2 — Mapear arquivos alterados para nós do grafo

### Leia o nó raiz primeiro

Leia `.context_brain/_wiki/index.md` para entender a topologia atual do grafo antes de modificar qualquer coisa.

### Tabela de mapeamento: código → nó wiki

| Padrão de arquivo alterado | Nós wiki potencialmente afetados |
|---|---|
| `backend/cmd/api/main.go` | `Backend_Arquitetura.md` (grupos de rota, startup) |
| `backend/internal/<módulo>/model.go` | `_raw/Backend_Models.md`, `Feature_<área>.md` |
| `backend/internal/<módulo>/handler.go` | `Backend_Arquitetura.md#<módulo>`, `Integracao_API.md` |
| `backend/internal/<módulo>/service.go` | `Backend_Arquitetura.md#<módulo>`, `Feature_<área>.md` |
| `backend/internal/<módulo>/repository.go` | `_raw/Backend_Models.md` |
| `backend/internal/middleware/` | `Backend_Arquitetura.md#middleware` |
| `front-backoffice/src/api/<módulo>.ts` | `Integracao_API.md`, `Backoffice_Contextos_e_Lib.md#API_Barrel` |
| `front-backoffice/src/api/index.ts` | `Backoffice_Contextos_e_Lib.md#API_Barrel` |
| `front-backoffice/src/contexts/` | `Backoffice_Contextos_e_Lib.md`, `_raw/Front_Hooks_e_Estados.md` |
| `front-backoffice/src/lib/` | `Backoffice_Contextos_e_Lib.md` |
| `front-backoffice/src/pages/<Página>/` | `Front_Paginas_e_Rotas.md`, `Feature_<área>.md` |
| `front-backoffice/src/constants/Tabs.tsx` | `Backoffice_Contextos_e_Lib.md#Tabs` |
| `front-backoffice/src/types/` | `Integracao_API.md`, `Feature_<área>.md` |
| `front-backoffice/src/routes/` | `Front_Paginas_e_Rotas.md#front-backoffice` |
| `front-site/src/pages/<Página>/` | `Front_Paginas_e_Rotas.md#front-site` |
| `front-site/src/api/` | `Integracao_API.md` |

Construa a lista de **nós afetados** com base nessa tabela e no diff real.

---

## Passo 3 — Reconstruir o subgrafo afetado

Para cada nó afetado identificado no Passo 2:

1. Leia o arquivo wiki atual
2. Extraia os `[[links]]` que ele referencia — esses são seus vizinhos no grafo
3. Verifique se os vizinhos também precisam ser atualizados (ex: um `Feature_X.md` pode referenciar `Integracao_API.md`, que também precisa de atualização)
4. Adicione vizinhos afetados à lista se ainda não estiverem nela

Repita até que todos os nós transitivamente afetados estejam na lista.

---

## Passo 4 — Atualizar cada nó

Para cada nó na lista de nós afetados, edite o arquivo wiki correspondente.

### Regras de edição

**O que atualizar:**
- Status de integração: `⚠️ mock (TODO)` / `❌ TODO` → `✅ integrado` quando o código comprova
- Tabelas de endpoints em `Integracao_API.md`: adicione rotas novas, corrija paths, atualize métodos
- Lista de arquivos relevantes em `Feature_*.md`: adicione/corrija caminhos reais
- Descrições de comportamento: reflita o que o código faz agora, não o que fazia antes
- Gaps conhecidos resolvidos: remova da seção `⚠ Gaps Conhecidos` ou mova para uma nota histórica

**O que preservar:**
- Frontmatter YAML (`---`) exatamente como está
- Estrutura de seções e hierarquia de headings
- Links internos Obsidian `[[NomeDoArquivo]]` e `[[arquivo#seção]]` — nunca quebre um link existente
- Tom objetivo e técnico; nenhum texto de "foi implementado nesta PR"

**Nunca:**
- Basear atualização em suposição — toda mudança deve ser comprovada pelo diff
- Apagar seções inteiras sem confirmar que o conteúdo não é mais válido
- Adicionar comentários sobre a PR, o autor ou a data da mudança

---

## Passo 5 — Atualizar o nó raiz

Leia e atualize `.context_brain/_wiki/index.md`:
- Ajuste a linha descritiva de qualquer nó que mudou de status
- Remova gaps resolvidos da seção `⚠ Gaps Conhecidos`
- Adicione novos gaps se o diff revelou problemas não documentados

---

## Passo 6 — Relatório final

Liste todos os nós modificados com uma linha por nó:

```
Subgrafo percorrido: index.md → [nós afetados]

Nós atualizados:
✅ Integracao_API.md       — <o que mudou em uma linha>
✅ Feature_X.md            — <o que mudou em uma linha>
✅ index.md                — <o que mudou em uma linha>

Nós lidos mas não alterados (sem mudança necessária):
─  Backend_Arquitetura.md
```
