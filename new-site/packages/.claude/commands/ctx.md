---
description: Carrega o contexto do repositório navegando o vault .context_brain como um grafo Obsidian. Siga os [[links]] a partir do index até cobrir os nós relevantes para a tarefa.
---

Navegue o vault `.context_brain/_wiki/` como um grafo orientado, seguindo os links `[[NomeDoArquivo]]` do Obsidian. O objetivo é construir um mapa de contexto preciso antes de qualquer implementação.

---

## Algoritmo de Travessia

### Passo 1 — Leia o nó raiz

Leia `.context_brain/_wiki/index.md`.

Este arquivo é o **MOC (Map of Content)**: o nó raiz do grafo. Ele lista todos os nós do vault com uma linha descritiva. Extraia:
- Todos os `[[NomeDoArquivo]]` referenciados
- Os **Gaps Conhecidos** listados (seção `⚠ Gaps Conhecidos`)

### Passo 2 — Identifique os nós de entrada relevantes

Se `$ARGUMENTS` foi fornecido, use-o como hint de área (ex: `backend`, `permissions`, `auth`, `front`, `api`, `cronograma`). Localize no index os nós que melhor correspondem a essa área e comece por eles.

Se nenhum argumento foi fornecido, use como nós de entrada iniciais:
- `Visao_Geral.md`
- `Backend_Arquitetura.md`
- `Integracao_API.md`

### Passo 3 — Travessia em largura (BFS)

Mantenha uma fila de nós a visitar e um conjunto de nós já visitados.

Para cada nó na fila:
1. Leia o arquivo `_wiki/<NomeDoArquivo>.md`
2. Extraia todos os `[[links]]` e `[[arquivo#seção]]` encontrados no corpo
3. Para cada link extraído: se o arquivo existir em `_wiki/` e ainda não foi visitado → adicione à fila
4. Marque o nó como visitado

**Regra de poda:** Se um nó for do tipo `_raw/` (ex: `_raw/Backend_Models.md`, `_raw/Front_Hooks_e_Estados.md`), leia-o apenas se for diretamente referenciado pelos nós de entrada ou se `$ARGUMENTS` indicar relevância. Esses arquivos são extensos e contêm detalhe de implementação — leia quando necessário, não por padrão.

**Profundidade máxima:** Interrompa a travessia quando todos os nós alcançáveis a partir dos nós de entrada tiverem sido visitados, ou quando o custo de leitura superar claramente o benefício (ex: nós `_raw` não diretamente conectados à área de interesse).

### Passo 4 — Monte o mapa de contexto

Após a travessia, sintetize em formato conciso:

#### Grafo Percorrido
Liste os nós visitados e as arestas seguidas:
```
index.md
  └── Visao_Geral.md
        └── Backend_Arquitetura.md
              └── _raw/Backend_Models.md (poda: lido sob demanda)
        └── Integracao_API.md
  └── Feature_X.md
        └── Backoffice_Contextos_e_Lib.md
```

#### Estado por Camada

| Camada | Módulo/Área | Status | Arquivo principal |
|---|---|---|---|
| Backend | `<módulo>` | ✅ / ⚠️ / ❌ | `internal/<módulo>/handler.go` |
| API | `<endpoint>` | ✅ / ⚠️ mock / ❌ ausente | `Integracao_API.md#<seção>` |
| Frontend | `<página ou contexto>` | ✅ / ⚠️ / ❌ | `src/pages/<X>/index.tsx` |

#### Gaps e Invariantes Relevantes
Liste apenas gaps que impactam a área de trabalho, copiados dos wikis visitados.

### Passo 5 — Pergunta de encerramento

Ao final do mapa, pergunte: **"Qual é a tarefa?"**

Não faça nenhuma modificação de código neste comando. É apenas leitura, travessia e síntese.
