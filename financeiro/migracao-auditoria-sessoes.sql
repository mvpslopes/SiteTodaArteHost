-- Migração: tabelas de sessões e auditoria de usuários
-- Execute este script no banco existente do Sistema Financeiro TodaArte.

CREATE TABLE IF NOT EXISTS sessoes_usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  login_at DATETIME NOT NULL,
  logout_at DATETIME DEFAULT NULL,
  last_activity_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sessoes_user (user_id),
  INDEX idx_sessoes_login (login_at),
  INDEX idx_sessoes_logout (logout_at),
  CONSTRAINT fk_sessoes_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  sessao_id INT UNSIGNED DEFAULT NULL,
  acao ENUM('login','logout','acesso','criar','atualizar','excluir') NOT NULL,
  recurso VARCHAR(100) NOT NULL,
  referencia_id INT UNSIGNED DEFAULT NULL,
  detalhes JSON DEFAULT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  path VARCHAR(255) DEFAULT NULL,
  metodo_http VARCHAR(10) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_auditoria_user (user_id),
  INDEX idx_auditoria_sessao (sessao_id),
  INDEX idx_auditoria_recurso (recurso),
  INDEX idx_auditoria_acao (acao),
  CONSTRAINT fk_auditoria_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_auditoria_sessao FOREIGN KEY (sessao_id) REFERENCES sessoes_usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

