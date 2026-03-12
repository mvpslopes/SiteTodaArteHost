-- Migração: tabela de gastos fixos mensais
-- Execute este script no banco já existente do Sistema Financeiro TodaArte.

CREATE TABLE IF NOT EXISTS gastos_fixos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao VARCHAR(500) DEFAULT NULL,
  valor_padrao DECIMAL(15,2) DEFAULT NULL,
  dia_vencimento TINYINT UNSIGNED NOT NULL,
  mes_inicio TINYINT UNSIGNED NOT NULL,
  ano_inicio SMALLINT UNSIGNED NOT NULL,
  mes_fim TINYINT UNSIGNED DEFAULT NULL,
  ano_fim SMALLINT UNSIGNED DEFAULT NULL,
  metodo_pagamento ENUM('pix','boleto','ted','dinheiro','cheque','pix_nota_fiscal') DEFAULT NULL,
  favorecido_id INT UNSIGNED DEFAULT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gastos_fixos_ativo (ativo),
  INDEX idx_gastos_fixos_vencimento (dia_vencimento),
  CONSTRAINT fk_gastos_fixos_favorecido FOREIGN KEY (favorecido_id) REFERENCES favorecidos(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

