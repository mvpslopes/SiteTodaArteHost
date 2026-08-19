-- Guarda senha de forma reversível para exibir na tela Usuários
-- (login continua usando password_hash). Execute no phpMyAdmin se o auto-migrate não rodar.
ALTER TABLE usuarios ADD COLUMN password_enc TEXT DEFAULT NULL;
