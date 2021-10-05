# Semcomp Backend

## Execução

- Instale o Node versão LTS no seu computador.
- Instale as depencias do projeto com `npm install`.
- Baixa o arquivo `config.zip` do drive do site semcomp e extraia na raiz do projeto.
- Inicie o projeto com `npm run dev`, ele estara rodando na porta 8080 do seu computador.

## Principais bibliotecas utilizadas

- Servidor http
  - express
- Servidor socket
  - socket.io
- Comunicação com o banco de dados (ORM)
  - mongoose
- Criptografia
  - bcryptjs
- Token
  - jsonwebtoken
- Authenticação
  - oauth
  - passport
- Linter
  - eslint
- Emails
  - nodemailer
- Notificações
  - web-push

## Arquitetura

Esse projeto possui uma arquitetura orientada a serviços com as seguintes camadas:

- Routers: Direcionam as requisições HTTP para os **controllers**
- Controllers: Recebem as requisições, executam os **services** necessários e enviam a resposta adequada
- Services: Executam a lógica de negocio da aplicação, fazendo operações, utilizando modelos do banco de dados e chamando API's
- Models: Modelos dos documentos armazenados no banco

## Time

- 2021
  - Rafael Doering
  - Henrique Tadashi Tarzia
  - Guilherme Jun
  - Michelle Wingter
