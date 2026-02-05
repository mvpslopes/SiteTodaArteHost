-- Importar 30 saídas de janeiro/2026 (planilha fornecida)
-- Execute no phpMyAdmin no banco u179630068_todaarte_bd
-- Método "Deb" foi mapeado para "ted" (ajuste no sistema se preferir "dinheiro")

SET NAMES utf8mb4;

-- 1) Inserir destinos que ainda não existem (favorecidos)
INSERT INTO favorecidos (nome, ativo) SELECT 'Marcus Lopes', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Marcus Lopes' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Banco de Dados - Grupo Raça', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Banco de Dados - Grupo Raça' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Dominio LandPage - Ariane', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Dominio LandPage - Ariane' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Tarifa Boleto', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Tarifa Boleto' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Lara Tavares', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Lara Tavares' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Ana Tavares', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Ana Tavares' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Victor', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Victor' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Toda Arte', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Toda Arte' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Convênios', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Convênios' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Cesta de Relacionamento', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Cesta de Relacionamento' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Bruno', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Bruno' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Contabilidade - TA - Raizes', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Contabilidade - TA - Raizes' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Angélica Cirino', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Angélica Cirino' LIMIT 1);
INSERT INTO favorecidos (nome, ativo) SELECT 'Aline', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM favorecidos WHERE nome = 'Aline' LIMIT 1);

-- 2) Inserir as 30 transações (saídas)
-- favorecido_id obtido por subconsulta ao nome do destino
INSERT INTO transacoes (tipo, data_transacao, valor, metodo_pagamento, favorecido_id, descricao)
VALUES
('saida', '2026-01-02', 50.00, 'pix',     (SELECT id FROM favorecidos WHERE nome = 'Marcus Lopes' LIMIT 1), 'Vetor Logo Diego - Marcus'),
('saida', '2026-01-05', 50.00, 'pix',     (SELECT id FROM favorecidos WHERE nome = 'Banco de Dados - Grupo Raça' LIMIT 1), 'Banco de Dados - Grupo Raça'),
('saida', '2026-01-05', 40.00, 'pix',     (SELECT id FROM favorecidos WHERE nome = 'Dominio LandPage - Ariane' LIMIT 1), 'Dominio LandPage - Ariane'),
('saida', '2026-01-06', 2.91, 'boleto',   (SELECT id FROM favorecidos WHERE nome = 'Tarifa Boleto' LIMIT 1), 'Tarifa Boleto'),
('saida', '2026-01-08', 1000.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Lara Tavares' LIMIT 1), 'Nucave - Lara'),
('saida', '2026-01-09', 3558.75, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Lara Tavares' LIMIT 1), 'Pag Lara - Nerimar'),
('saida', '2026-01-09', 810.50, 'pix',    (SELECT id FROM favorecidos WHERE nome = 'Ana Tavares' LIMIT 1), 'Pag Ana Beatriz'),
('saida', '2026-01-09', 315.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Marcus Lopes' LIMIT 1), 'Pag Marcus'),
('saida', '2026-01-09', 305.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Victor' LIMIT 1), 'Pag Victor'),
('saida', '2026-01-12', 250.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Toda Arte' LIMIT 1), 'Pag Toda Arte'),
('saida', '2026-01-12', 569.80, 'ted',   (SELECT id FROM favorecidos WHERE nome = 'Convênios' LIMIT 1), 'Deb Convenios'),
('saida', '2026-01-12', 46.65, 'ted',    (SELECT id FROM favorecidos WHERE nome = 'Cesta de Relacionamento' LIMIT 1), 'Cesta de Relacionamento'),
('saida', '2026-01-13', 2000.00, 'pix',  (SELECT id FROM favorecidos WHERE nome = 'Bruno' LIMIT 1), 'Pag Bruno'),
('saida', '2026-01-14', 600.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Contabilidade - TA - Raizes' LIMIT 1), 'Contabilidade - TA - Raizes'),
('saida', '2026-01-14', 239.60, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Angélica Cirino' LIMIT 1), 'Angélica Cirino'),
('saida', '2026-01-16', 195.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Victor' LIMIT 1), 'Pag Victor'),
('saida', '2026-01-16', 65.00, 'pix',    (SELECT id FROM favorecidos WHERE nome = 'Marcus Lopes' LIMIT 1), 'Pag Marcus'),
('saida', '2026-01-16', 130.00, 'pix',  (SELECT id FROM favorecidos WHERE nome = 'Marcus Lopes' LIMIT 1), 'Pag Marcus'),
('saida', '2026-01-16', 1500.00, 'pix',  (SELECT id FROM favorecidos WHERE nome = 'Bruno' LIMIT 1), 'Pag Bruno'),
('saida', '2026-01-19', 100.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Bruno' LIMIT 1), 'Pag Bruno'),
('saida', '2026-01-20', 50.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Marcus Lopes' LIMIT 1), 'Pag Programa Marcus'),
('saida', '2026-01-20', 100.00, 'pix',  (SELECT id FROM favorecidos WHERE nome = 'Bruno' LIMIT 1), 'Pag Bruno'),
('saida', '2026-01-26', 50.00, 'pix',   (SELECT id FROM favorecidos WHERE nome = 'Aline' LIMIT 1), 'Aline'),
('saida', '2026-01-26', 135.00, 'pix',  (SELECT id FROM favorecidos WHERE nome = 'Victor' LIMIT 1), 'Pagamento Victor'),
('saida', '2026-01-26', 1000.00, 'pix', (SELECT id FROM favorecidos WHERE nome = 'Toda Arte' LIMIT 1), 'Toda Arte'),
('saida', '2026-01-26', 1621.00, 'pix', (SELECT id FROM favorecidos WHERE nome = 'Lara Tavares' LIMIT 1), 'Pagamento Lara Mes'),
('saida', '2026-01-26', 1000.00, 'pix', (SELECT id FROM favorecidos WHERE nome = 'Toda Arte' LIMIT 1), 'Toda Arte'),
('saida', '2026-01-26', 190.00, 'pix',  (SELECT id FROM favorecidos WHERE nome = 'Marcus Lopes' LIMIT 1), 'Pagamento Marcus'),
('saida', '2026-01-26', 1400.00, 'pix', (SELECT id FROM favorecidos WHERE nome = 'Toda Arte' LIMIT 1), 'Toda Arte'),
('saida', '2026-01-30', 100.00, 'pix',  (SELECT id FROM favorecidos WHERE nome = 'Toda Arte' LIMIT 1), 'Toda Arte');
