-- Criar tabela usuarios e inserir usuário Root
-- Execute no phpMyAdmin no banco u179630068_todaarte_bd

SET NAMES utf8mb4;

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

-- Root: marcus.lopes@todaarte.com.br | Senha: *.Admin14!
INSERT INTO usuarios (email, password_hash, nome, perfil, ativo) VALUES
('marcus.lopes@todaarte.com.br', '$2a$12$SFkTfB6T0BHahCraxl2d1eWgd/exHAfXmYMRsDQUKUDUSKQiQvhUa', 'Marcus Lopes', 'root', 1)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nome = VALUES(nome), perfil = 'root';
