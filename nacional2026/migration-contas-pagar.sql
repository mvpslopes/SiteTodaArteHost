-- Migração: Contas a pagar (saídas parceladas)
-- Execute no phpMyAdmin APÓS o schema inicial

CREATE TABLE IF NOT EXISTS contas_pagar (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  fornecedor VARCHAR(255) DEFAULT NULL,
  espaco_id INT UNSIGNED DEFAULT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  parcelado TINYINT(1) NOT NULL DEFAULT 0,
  qtd_parcelas TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('aberto','parcial','quitado','cancelado') NOT NULL DEFAULT 'aberto',
  data_competencia DATE NOT NULL,
  observacoes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contas_pagar_status (status),
  INDEX idx_contas_pagar_espaco (espaco_id),
  CONSTRAINT fk_contas_pagar_espaco FOREIGN KEY (espaco_id) REFERENCES espacos(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parcelas_pagar (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conta_pagar_id INT UNSIGNED NOT NULL,
  numero TINYINT UNSIGNED NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE DEFAULT NULL,
  status ENUM('pendente','paga','atrasada','cancelada') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_parcela_pagar_num (conta_pagar_id, numero),
  INDEX idx_parcelas_pagar_vencimento (data_vencimento),
  INDEX idx_parcelas_pagar_status (status),
  CONSTRAINT fk_parcelas_pagar_conta FOREIGN KEY (conta_pagar_id) REFERENCES contas_pagar(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Se a coluna já existir, ignore o erro:
ALTER TABLE transacoes ADD COLUMN parcela_pagar_id INT UNSIGNED DEFAULT NULL AFTER parcela_id;
ALTER TABLE transacoes ADD CONSTRAINT fk_trans_parcela_pagar FOREIGN KEY (parcela_pagar_id) REFERENCES parcelas_pagar(id) ON DELETE SET NULL ON UPDATE CASCADE;
