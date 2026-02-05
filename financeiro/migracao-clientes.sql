-- Migração: adicionar tabela clientes e coluna cliente_id em transacoes
-- Execute no phpMyAdmin no banco u179630068_todaarte_bd (uma vez).
-- Se der "Erro 500" em Transações ou Clientes, falta rodar esta migração.
-- Se ao rodar der erro de "column already exists" ou "Duplicate foreign key", ignore (já foi aplicada).

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clientes_ativo (ativo),
  INDEX idx_clientes_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar coluna cliente_id em transacoes (execute uma vez)
ALTER TABLE transacoes ADD COLUMN cliente_id INT UNSIGNED DEFAULT NULL AFTER favorecido_id;
ALTER TABLE transacoes ADD CONSTRAINT fk_transacoes_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE;
