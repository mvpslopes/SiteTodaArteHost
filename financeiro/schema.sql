-- Sistema Financeiro TodaArte - Schema MySQL
-- Banco: u179630068_todaarte_bd
-- Execute no phpMyAdmin ou MySQL após criar o banco

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Usuários do sistema (perfis: root, administrador, usuario, cliente)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_enc TEXT DEFAULT NULL,
  nome VARCHAR(255) NOT NULL DEFAULT '',
  perfil ENUM('root','administrador','usuario','cliente') NOT NULL DEFAULT 'usuario',
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
  metodo_pagamento ENUM('pix','boleto','ted','dinheiro','cheque','pix_nota_fiscal') NOT NULL,
  favorecido_id INT UNSIGNED DEFAULT NULL,
  cliente_id INT UNSIGNED DEFAULT NULL,
  descricao VARCHAR(500) DEFAULT NULL,
  conciliada TINYINT(1) NOT NULL DEFAULT 0,
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

-- Sessões dos usuários (auditoria de login/logout)
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

-- Auditoria de ações dos usuários
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

-- Demandas (clientes fixos e avulsos)
CREATE TABLE IF NOT EXISTS demandas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_cliente ENUM('fixo','avulso') NOT NULL,
  cliente_id INT UNSIGNED DEFAULT NULL,
  categoria ENUM('cliente_avulso','cliente_fixo','cliente_gestao') DEFAULT NULL,
  nome_cliente_avulso VARCHAR(255) DEFAULT NULL,
  data_pedido DATE NOT NULL,
  descricao VARCHAR(500) NOT NULL,
  quem_pediu VARCHAR(255) NOT NULL,
  data_execucao DATE DEFAULT NULL,
  data_entrega DATE DEFAULT NULL,
  valor_unitario DECIMAL(15,2) NOT NULL,
  quantidade INT UNSIGNED NOT NULL DEFAULT 1,
  valor_total DECIMAL(15,2) NOT NULL,
  prioridade ENUM('baixa','media','alta') NOT NULL DEFAULT 'media',
  status ENUM('pendente','em_execucao','concluida','cancelada') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_demandas_tipo_cliente (tipo_cliente),
  INDEX idx_demandas_cliente (cliente_id),
  INDEX idx_demandas_status (status),
  INDEX idx_demandas_data_pedido (data_pedido),
  CONSTRAINT fk_demandas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gastos fixos mensais (não lançam automaticamente em transações)
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

-- Tarefas fixas de checklist interno
CREATE TABLE IF NOT EXISTS checklist_tarefas_fixas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT DEFAULT NULL,
  periodicidade ENUM('diaria','segunda','terca','quarta','quinta','sexta','mensal') NOT NULL DEFAULT 'diaria',
  ordem INT UNSIGNED NOT NULL DEFAULT 1,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  responsavel_id INT UNSIGNED DEFAULT NULL,
  dia_mes TINYINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_checklist_periodicidade (periodicidade),
  INDEX idx_checklist_ativo (ativo),
  INDEX idx_checklist_responsavel (responsavel_id),
  CONSTRAINT fk_checklist_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Execução diária do checklist por usuário
CREATE TABLE IF NOT EXISTS checklist_execucoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tarefa_fixa_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  data_referencia DATE NOT NULL,
  concluida TINYINT(1) NOT NULL DEFAULT 0,
  observacao VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_checklist_execucao (tarefa_fixa_id, user_id, data_referencia),
  INDEX idx_checklist_execucoes_user_data (user_id, data_referencia),
  CONSTRAINT fk_checklist_tarefa_fixa FOREIGN KEY (tarefa_fixa_id) REFERENCES checklist_tarefas_fixas(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_checklist_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tarefas fixas padrão para rotina interna (ex.: Ana)
INSERT INTO checklist_tarefas_fixas (titulo, descricao, periodicidade, ordem, ativo) VALUES
('Agendar publicações dos clientes fixos', 'Agendar as publicações de todos os clientes fixos na semana.', 'diaria', 1, 1),
('Atualizar planilhas de produção de cada cliente', 'Manter planilhas de produção atualizadas com status, prazos e entregas.', 'diaria', 2, 1),
('Organizar e atualizar banco de dados da empresa', 'Inserir e organizar todos os materiais da empresa no banco de dados.', 'diaria', 3, 1),
('Organizar materiais do Grupo Raça no banco de dados', 'Inserir e organizar todos os materiais do Grupo Raça no banco de dados.', 'diaria', 4, 1),
('Postagens diárias na página @todamarcha', 'Postar no mínimo 3 anúncios de coberturas e 3 lotes de leilões atuais, respeitando as regras (máx. 2 lotes por leilão nos stories, repost, link WhatsApp com chamada personalizada).', 'diaria', 5, 1),
('Cobrar agenda da semana - MÍDIAS DE LEILÕES', 'Entre 08h e 10h, cobrar agenda da semana no grupo MÍDIAS DE LEILÕES.', 'segunda', 1, 1),
('Cobrar materiais dos leilões da semana - Grupo Raça', 'Cobrar informações, materiais e conteúdos dos leilões/lives da semana no grupo.', 'segunda', 2, 1),
('Lembrete equipe de mídias - banco de dados', 'Lembrar a equipe de inserir no banco de dados todos os materiais produzidos (leilões, lives, eventos).', 'terca', 1, 1),
('Reforçar uso do Instagram da empresa', 'Reforçar postagens de bastidores, dia a dia, equipe, haras, eventos e lives no Instagram da empresa.', 'terca', 2, 1),
('Cobrar agenda da próxima semana - MÍDIAS DE LEILÕES', 'Entre 08h e 10h, cobrar agenda dos leilões e eventos da semana seguinte.', 'quinta', 1, 1),
('Organizar relatório de pagamento dos freelancers', 'Conferir entregas da semana, valores e serviços realizados e enviar relatório de pagamentos.', 'sexta', 1, 1)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

SET FOREIGN_KEY_CHECKS = 1;
