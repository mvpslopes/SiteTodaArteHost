-- Criação da tabela de Demandas
-- Execute este script no banco já existente do Sistema Financeiro TodaArte.

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

-- Caso a tabela já exista sem a coluna, garantir inclusão
ALTER TABLE demandas
  ADD COLUMN IF NOT EXISTS nome_cliente_avulso VARCHAR(255) DEFAULT NULL;

ALTER TABLE demandas
  ADD COLUMN IF NOT EXISTS prioridade ENUM('baixa','media','alta') NOT NULL DEFAULT 'media';

