-- Migração: Checklist interno de tarefas fixas
-- Execute este script no banco já existente do Sistema Financeiro TodaArte.

CREATE TABLE IF NOT EXISTS checklist_tarefas_fixas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT DEFAULT NULL,
  periodicidade ENUM('diaria','segunda','terca','quarta','quinta','sexta') NOT NULL DEFAULT 'diaria',
  ordem INT UNSIGNED NOT NULL DEFAULT 1,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_checklist_periodicidade (periodicidade),
  INDEX idx_checklist_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

