# Semcomp Frontend

## Execução

- Instale o Node versão LTS no seu computador.
- Instale as dependências com `npm install`.
- Inicie o projeto com `npm start`, o projeto poderá ser acessado na porta 3000.

## Principais bibliotecas utilizadas

- _Axios:_ Conexão com a API do back-end
- _Bootstrap:_ Framework para componentes de interface
- _Redux:_ Gerenciamento de estados da aplicação

## Organização do projeto

- API: Objeto que faz a conexão com as funcionalidades do back-end, e os handlers que manipulam a resposta recebida dos endpoints ou tratam possíveis erros.
- Assets: Arquivos de mídia (imagens, vídeos) que podem ser inseridos pelas páginas.
- Components: Fragmentos de código que podem ser inseridos dentro de páginas.
- Constants: Constantes cujos valores são usados ao redor do projeto.
- Libs: Funções utilitárias que podem ser reaproveitadas nos arquivos do projeto.
- Pages: Páginas completas que poderão ser acessadas pelo usuário.
- Redux: Elementos do gerenciador de estados (Store, Actions, Reducers)
- Router: Rotas que o usuário pode tomar e o sistema pode renderizar uma página. Trata também privilégios de acesso das páginas.
