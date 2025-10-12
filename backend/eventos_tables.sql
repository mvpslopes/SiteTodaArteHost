-- Tabelas para o Sistema de Viabilidade de Eventos

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    local VARCHAR(255),
    status ENUM('planejamento', 'em_andamento', 'concluido', 'cancelado') DEFAULT 'planejamento',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Custos de Eventos
CREATE TABLE IF NOT EXISTS custos_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- Tabela de Receitas de Eventos
CREATE TABLE IF NOT EXISTS receitas_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- Tabela de Participantes de Eventos
CREATE TABLE IF NOT EXISTS participantes_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    tipo ENUM('cliente', 'fornecedor', 'colaborador', 'convidado') NOT NULL,
    status ENUM('confirmado', 'pendente', 'cancelado') DEFAULT 'pendente',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- Tabela de Atividades de Eventos (Cronograma)
CREATE TABLE IF NOT EXISTS atividades_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    responsavel VARCHAR(255),
    status ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'pendente',
    prioridade ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_eventos_data ON eventos(data);
CREATE INDEX idx_eventos_status ON eventos(status);
CREATE INDEX idx_custos_evento ON custos_eventos(evento_id);
CREATE INDEX idx_custos_categoria ON custos_eventos(categoria);
CREATE INDEX idx_receitas_evento ON receitas_eventos(evento_id);
CREATE INDEX idx_receitas_categoria ON receitas_eventos(categoria);
CREATE INDEX idx_participantes_evento ON participantes_eventos(evento_id);
CREATE INDEX idx_participantes_tipo ON participantes_eventos(tipo);
CREATE INDEX idx_atividades_evento ON atividades_eventos(evento_id);
CREATE INDEX idx_atividades_data ON atividades_eventos(data_inicio);

-- Dados de exemplo (opcional)
INSERT INTO eventos (nome, data, descricao, local, status) VALUES
('Festa de Aniversário', '2024-12-15', 'Festa de aniversário de 50 anos', 'Salão de Festas', 'planejamento'),
('Workshop de Marketing', '2024-11-20', 'Workshop sobre marketing digital', 'Centro de Convenções', 'planejamento'),
('Conferência Anual', '2024-10-30', 'Conferência anual da empresa', 'Hotel Plaza', 'planejamento');

-- Inserir algumas categorias de custos e receitas como exemplo
INSERT INTO custos_eventos (evento_id, descricao, valor, categoria) VALUES
(1, 'Locação do salão', 500.00, 'Locação'),
(1, 'Decoração', 300.00, 'Decoração'),
(1, 'Alimentação', 800.00, 'Alimentação'),
(2, 'Material didático', 150.00, 'Marketing'),
(2, 'Coffee break', 200.00, 'Alimentação'),
(3, 'Locação do hotel', 2000.00, 'Locação'),
(3, 'Som e iluminação', 500.00, 'Som e Iluminação');

INSERT INTO receitas_eventos (evento_id, descricao, valor, categoria) VALUES
(1, 'Ingressos vendidos', 1200.00, 'Ingressos'),
(1, 'Patrocínio local', 500.00, 'Patrocínios'),
(2, 'Inscrições', 800.00, 'Ingressos'),
(2, 'Patrocínio empresa', 1000.00, 'Patrocínios'),
(3, 'Ingressos premium', 3000.00, 'Ingressos'),
(3, 'Patrocínio principal', 5000.00, 'Patrocínios');

