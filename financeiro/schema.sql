-- Sistema Financeiro TodaArte - Schema MySQL
-- Banco: u179630068_todaarte_bd
-- Execute no phpMyAdmin ou MySQL após criar o banco

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Usuários do sistema (perfis: root, administrador, usuario)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL DEFAULT '',
  perfil ENUM('root','administrador','usuario') NOT NULL DEFAULT 'usuario',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_email (email),
  INDEX idx_usuarios_perfil (perfil),
  INDEX idx_usuarios_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuário Root (acesso total)
-- Email: marcus.lopes@todaarte.com.br | Senha: *.Admin14!
INSERT INTO usuarios (email, password_hash, nome, perfil, ativo) VALUES
('marcus.lopes@todaarte.com.br', '$2a$12$SFkTfB6T0BHahCraxl2d1eWgd/exHAfXmYMRsDQUKUDUSKQiQvhUa', 'Marcus Lopes', 'root', 1)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nome = VALUES(nome), perfil = 'root';

-- Destinos (pessoas ou instituições para onde vai/sai o valor - ex-favorecidos)
CREATE TABLE IF NOT EXISTS favorecidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_favorecidos_ativo (ativo),
  INDEX idx_favorecidos_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clientes (para atribuir em entradas)
CREATE TABLE IF NOT EXISTS clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clientes_ativo (ativo),
  INDEX idx_clientes_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transações (entradas e saídas)
CREATE TABLE IF NOT EXISTS transacoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('entrada','saida') NOT NULL,
  data_transacao DATE NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  metodo_pagamento ENUM('pix','boleto','ted','dinheiro','cheque') NOT NULL,
  favorecido_id INT UNSIGNED DEFAULT NULL,
  cliente_id INT UNSIGNED DEFAULT NULL,
  descricao VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_transacoes_data (data_transacao),
  INDEX idx_transacoes_tipo (tipo),
  INDEX idx_transacoes_favorecido (favorecido_id),
  INDEX idx_transacoes_cliente (cliente_id),
  INDEX idx_transacoes_mes_ano (data_transacao),
  CONSTRAINT fk_transacoes_favorecido FOREIGN KEY (favorecido_id) REFERENCES favorecidos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_transacoes_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
