# Backend - Toda Arte

## Como usar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:
   ```env
   DB_HOST=localhost
   DB_USER=mczpgf_admin
   DB_PASSWORD=yEUYA6smWe
   DB_NAME=mczpgf_todaarte
   DB_PORT=3306
   ```
3. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   Ou em modo produção:
   ```bash
   npm start
   ```

O backend estará rodando em http://localhost:3001

## Teste
Acesse http://localhost:3001/ para testar a conexão com o banco de dados. 