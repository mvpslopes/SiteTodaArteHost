# Sistema Financeiro TodaArte

Sistema interno para controle de transações (entradas/saídas), favorecidos e relatório mensal.

## Estrutura

- **api/** – Backend PHP (MySQL): favorecidos, transações, dashboard
- **src/** – Frontend React (Vite + TypeScript + Tailwind)
- **schema.sql** – Script para criar as tabelas no banco

## Banco de dados

1. No painel da Hostinger você já criou o banco `u179630068_todaarte_bd` e o usuário.
2. No phpMyAdmin, selecione o banco e execute o conteúdo de **schema.sql** (cria as tabelas `favorecidos` e `transacoes`).

## Desenvolvimento local

```bash
cd financeiro
npm install
npm run dev
```

O frontend sobe em `http://localhost:5174`. Para a API responder em `/api`, use um dos jeitos:

- **Opção A:** Subir PHP na pasta do projeto (na raiz do repo, de forma que `financeiro/api` exista):
  ```bash
  cd c:\projetos\SiteTodaArteHost\financeiro
  php -S localhost:8080
  ```
  Depois altere no `vite.config.ts` o proxy para apontar para `http://localhost:8080` (já está assim). Assim as requisições a `/api` no dev são redirecionadas para o PHP.

- **Opção B:** Criar `api/db_config.local.php` com credenciais do seu MySQL local e apontar o navegador ou um proxy para essa API.

## Build e deploy no subdomínio

1. Gerar o build do frontend:
   ```bash
   cd financeiro
   npm run build
   ```

2. No servidor (Hostinger), o subdomínio deve apontar para a pasta:
   `/home/u179630068/domains/todaarte.com.br/public_html/financeiro`

3. Enviar os arquivos:
   - Conteúdo de **financeiro/dist/** → para **public_html/financeiro/** (index.html, assets/, .htaccess).
   - Conteúdo de **financeiro/api/** → para **public_html/financeiro/api/** (todos os .php e o .htaccess da api).

4. Garantir que o **schema.sql** já foi executado no banco `u179630068_todaarte_bd`.

Acesso: `https://financeiro.todaarte.com.br` (ou o endereço que você configurou para o subdomínio).

## Funcionalidades

- **Dashboard:** Seletor mês/ano, totais de entradas e saídas, saldo do mês e tabela com todas as transações do mês (data, tipo, favorecido, descrição, método, valor).
- **Transações:** Listagem com filtro por mês/ano, nova transação, editar e excluir. Campos: tipo (Entrada/Saída), data, valor, método (Pix, Boleto, TED, Dinheiro, Cheque), favorecido, descrição.
- **Favorecidos:** Listar, criar, editar e inativar (favorecidos inativos não aparecem no lançamento de transações).
