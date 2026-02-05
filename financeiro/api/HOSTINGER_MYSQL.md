# Corrigir "Access denied" no MySQL (Hostinger)

O erro `Access denied for user 'u179630068_root_todaarte'@'127.0.0.1'` significa que o MySQL está recusando o usuário ou a senha. Siga estes passos no painel da Hostinger:

## 1. Vincular o usuário ao banco

1. Acesse **hPanel** → **Bancos de dados** → **MySQL® Databases** (ou **Bancos de dados MySQL**).
2. Na seção **Bases de dados MySQL**, confira se existe a base **u179630068_todaarte_bd**.
3. Na seção **Utilizadores MySQL**, confira se existe o utilizador **u179630068_root_todaarte**.
4. Procure a área **“Adicionar utilizador à base de dados”** / **“Add user to database”** (ou uma tabela de privilégios).
5. Selecione o utilizador **u179630068_root_todaarte** e a base **u179630068_todaarte_bd**.
6. Marque **Todos os privilégios** / **ALL PRIVILEGES** e confirme.

Sem esse vínculo, o utilizador não pode aceder à base, mesmo com a senha correta.

## 2. Confirmar a senha

- A senha usada no **db_config.php** tem de ser **exatamente** a que está no painel para esse utilizador.
- Se tiver caracteres especiais (por exemplo `&`, `>`, `!`), copie de novo do painel ou altere a senha no painel para uma mais simples (ex.: só letras e números) e atualize o **db_config.php** com essa nova senha.

## 3. Atualizar o db_config.php

- Abra **api/db_config.php** e confira:
  - **DB_NAME:** `u179630068_todaarte_bd`
  - **DB_USER:** `u179630068_root_todaarte`
  - **DB_PASS:** a mesma senha do painel (entre aspas).

Depois de vincular o utilizador à base e acertar a senha no `db_config.php`, teste de novo em:

**https://financeiro.todaarte.com.br/api/test-db.php**

Se aparecer `"ok": true`, a conexão está a funcionar.
