# Semcomp Backoffice

## Execução
- Instale o Node versão LTS no seu computador.
- Instale as dependências com `npm install`.
- Inicie o projeto com `npm start`, o projeto poderá ser acessado na porta 3000.

## Build
- Instale o Node versão LTS no seu computador.
- Instale as depencias do projeto com ```npm install```.
- Build o projeto com ```npm run build```, uma pasta chamada `build` será criada na raiz do projeto contendo a build.

## Principais bibliotecas utilizadas

- Componentização
  - react
- Roteamento
  - react-router-dom
- Manejo de estados
  - redux
  - redux-persist
- Chamadas HTTP
  - axios
- Classes utilitátias CSS
  - tailwind
- Linter
   - eslint

## Organização do projeto
- api: Objeto que faz a conexão com as funcionalidades do back-end, e os handlers que manipulam a resposta recebida dos endpoints ou tratam possíveis erros.
- assets: Arquivos de mídia (imagens, vídeos) que podem ser inseridos pelas páginas.
- components: Fragmentos de código que podem ser inseridos dentro de páginas.
- constants: Constantes cujos valores são usados ao redor do projeto.
- libs: Funções utilitárias que podem ser reaproveitadas nos arquivos do projeto.
- pages: Páginas completas que poderão ser acessadas pelo usuário.
- redux: Elementos do gerenciador de estados (Store, Actions, Reducers)
- router: Rotas que o usuário pode tomar e o sistema pode renderizar uma página. Trata também privilégios de acesso das páginas.

## Time
- 2021
  - Rafael Doering
