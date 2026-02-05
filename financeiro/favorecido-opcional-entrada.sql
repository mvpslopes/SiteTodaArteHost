-- Destino opcional para transações do tipo ENTRADA
-- Execute no phpMyAdmin (uma vez). Se der erro de coluna já nullable, ignore.

SET NAMES utf8mb4;

ALTER TABLE transacoes
  MODIFY COLUMN favorecido_id INT UNSIGNED DEFAULT NULL;
