-- Migração: itens por camarote (pulseira, cota de patrocínio, etc.)
-- Execute no phpMyAdmin APÓS o schema.sql inicial

CREATE TABLE IF NOT EXISTS itens_espaco (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  espaco_id INT UNSIGNED NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT DEFAULT NULL,
  valor_padrao DECIMAL(15,2) NOT NULL DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_itens_espaco (espaco_id),
  INDEX idx_itens_ativo (ativo),
  CONSTRAINT fk_itens_espaco FOREIGN KEY (espaco_id) REFERENCES espacos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Se as colunas já existirem, ignore os erros abaixo:
ALTER TABLE vendas_espaco ADD COLUMN item_espaco_id INT UNSIGNED NULL AFTER espaco_id;
ALTER TABLE vendas_espaco ADD COLUMN quantidade INT UNSIGNED NOT NULL DEFAULT 1 AFTER valor_total;
ALTER TABLE vendas_espaco ADD CONSTRAINT fk_vendas_item FOREIGN KEY (item_espaco_id) REFERENCES itens_espaco(id) ON DELETE SET NULL ON UPDATE CASCADE;
