-- Nacional 2026 - Mangalarga Marchador - Organização Financeira
-- Execute no banco u179630068_nacional2026

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  perfil ENUM('root','admin') NOT NULL DEFAULT 'admin',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_login (login),
  INDEX idx_usuarios_perfil (perfil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  telefone VARCHAR(50) DEFAULT NULL,
  documento VARCHAR(30) DEFAULT NULL,
  observacoes TEXT DEFAULT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clientes_nome (nome),
  INDEX idx_clientes_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS espacos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT DEFAULT NULL,
  valor_venda DECIMAL(15,2) NOT NULL DEFAULT 0,
  custo DECIMAL(15,2) NOT NULL DEFAULT 0,
  status ENUM('disponivel','reservado','vendido','cancelado') NOT NULL DEFAULT 'disponivel',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_espacos_status (status),
  INDEX idx_espacos_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vendas_espaco (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  espaco_id INT UNSIGNED NOT NULL,
  cliente_id INT UNSIGNED NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  parcelado TINYINT(1) NOT NULL DEFAULT 0,
  qtd_parcelas TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('aberto','parcial','quitado','cancelado') NOT NULL DEFAULT 'aberto',
  data_venda DATE NOT NULL,
  observacoes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vendas_cliente (cliente_id),
  INDEX idx_vendas_espaco (espaco_id),
  INDEX idx_vendas_status (status),
  CONSTRAINT fk_vendas_espaco FOREIGN KEY (espaco_id) REFERENCES espacos(id) ON UPDATE CASCADE,
  CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS parcelas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  venda_espaco_id INT UNSIGNED NOT NULL,
  numero TINYINT UNSIGNED NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE DEFAULT NULL,
  status ENUM('pendente','paga','atrasada','cancelada') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_parcela_venda_num (venda_espaco_id, numero),
  INDEX idx_parcelas_vencimento (data_vencimento),
  INDEX idx_parcelas_status (status),
  CONSTRAINT fk_parcelas_venda FOREIGN KEY (venda_espaco_id) REFERENCES vendas_espaco(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transacoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('entrada','saida') NOT NULL,
  data_transacao DATE NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  descricao VARCHAR(500) DEFAULT NULL,
  metodo_pagamento ENUM('pix','boleto','ted','dinheiro','transferencia','cheque') DEFAULT NULL,
  cliente_id INT UNSIGNED DEFAULT NULL,
  espaco_id INT UNSIGNED DEFAULT NULL,
  parcela_id INT UNSIGNED DEFAULT NULL,
  created_by INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_transacoes_tipo (tipo),
  INDEX idx_transacoes_data (data_transacao),
  CONSTRAINT fk_trans_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_trans_espaco FOREIGN KEY (espaco_id) REFERENCES espacos(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_trans_parcela FOREIGN KEY (parcela_id) REFERENCES parcelas(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_trans_user FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO usuarios (login, password_hash, nome, perfil, ativo) VALUES
('marcus.lopes', '$2a$12$xvu7agHjOJaob0WCpE5Wt.809Z1kAPpr0Y8BXE5Js.vUp.D4ghcwm', 'Marcus Lopes', 'root', 1)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nome = VALUES(nome), perfil = 'root';
