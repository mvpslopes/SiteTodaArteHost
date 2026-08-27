-- Produção TodaArte — jobs, briefing, entregas, cronograma e notificações
-- O sistema também cria estas tabelas sozinho na primeira chamada da API.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS producao_jobs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED DEFAULT NULL,
  nome_cliente VARCHAR(255) NOT NULL,
  tipo ENUM('avulso','recorrente') NOT NULL DEFAULT 'avulso',
  servico_slug VARCHAR(80) NOT NULL,
  servico_nome VARCHAR(255) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  valor DECIMAL(15,2) DEFAULT NULL,
  valor_executor DECIMAL(15,2) DEFAULT NULL,
  metodo_pagamento ENUM('pix','boleto') NOT NULL DEFAULT 'pix',
  status VARCHAR(40) NOT NULL DEFAULT 'aguardando_briefing',
  public_token VARCHAR(64) NOT NULL,
  executor_id INT UNSIGNED DEFAULT NULL,
  atendente_id INT UNSIGNED DEFAULT NULL,
  created_by INT UNSIGNED DEFAULT NULL,
  complemento_briefing TEXT DEFAULT NULL,
  recado_retrabalho TEXT DEFAULT NULL,
  prazo DATE DEFAULT NULL,
  semana_ref DATE DEFAULT NULL,
  cronograma_id INT UNSIGNED DEFAULT NULL,
  pagamento_cliente ENUM('pendente','informado','confirmado','nao_se_aplica') NOT NULL DEFAULT 'pendente',
  pagamento_executor ENUM('pendente','liberado','pago') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_producao_token (public_token),
  INDEX idx_producao_status (status),
  INDEX idx_producao_executor (executor_id),
  INDEX idx_producao_cliente (cliente_id),
  CONSTRAINT fk_producao_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_producao_executor FOREIGN KEY (executor_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_producao_atendente FOREIGN KEY (atendente_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS producao_briefings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id INT UNSIGNED NOT NULL,
  respostas JSON DEFAULT NULL,
  preenchido_em DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_briefing_job (job_id),
  CONSTRAINT fk_briefing_job FOREIGN KEY (job_id) REFERENCES producao_jobs(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS producao_entregas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id INT UNSIGNED NOT NULL,
  versao INT UNSIGNED NOT NULL DEFAULT 1,
  arquivo VARCHAR(255) NOT NULL,
  nome_original VARCHAR(255) DEFAULT NULL,
  nota VARCHAR(500) DEFAULT NULL,
  uploaded_by INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entrega_job (job_id),
  CONSTRAINT fk_entrega_job FOREIGN KEY (job_id) REFERENCES producao_jobs(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS producao_cronograma (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  dia_semana TINYINT UNSIGNED NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  servico_slug VARCHAR(80) NOT NULL,
  executor_id INT UNSIGNED DEFAULT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cronograma_cliente (cliente_id),
  CONSTRAINT fk_cronograma_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS producao_notificacoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  job_id INT UNSIGNED DEFAULT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem VARCHAR(500) DEFAULT NULL,
  lida TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (user_id, lida),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS producao_executantes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo ENUM('executor','freelancer') NOT NULL DEFAULT 'executor',
  whatsapp VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  especialidade VARCHAR(255) DEFAULT NULL,
  usuario_id INT UNSIGNED DEFAULT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_executante_ativo (ativo),
  INDEX idx_executante_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

