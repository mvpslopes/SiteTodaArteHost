-- Senhas de acesso dos clientes (Instagram, YouTube, e-mail, Facebook e outros).
-- Só admin e operador consultam. O PHP também cria/atualiza esta tabela na primeira chamada da API.

CREATE TABLE IF NOT EXISTS cliente_acessos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  plataforma VARCHAR(80) NOT NULL,
  rotulo VARCHAR(80) DEFAULT NULL,
  login VARCHAR(255) NOT NULL DEFAULT '',
  senha_enc TEXT DEFAULT NULL,
  observacao VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_cliente_plataforma (cliente_id, plataforma),
  INDEX idx_cliente_acesso_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Se a tabela já existia com ENUM (sem campo "outro"), rode também:
ALTER TABLE cliente_acessos MODIFY COLUMN plataforma VARCHAR(80) NOT NULL;
-- Se der erro de coluna duplicada no comando abaixo, ignore: o campo já existe.
ALTER TABLE cliente_acessos ADD COLUMN rotulo VARCHAR(80) DEFAULT NULL AFTER plataforma;
