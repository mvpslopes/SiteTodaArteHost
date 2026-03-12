-- Migração para perfis: root, administrador, usuario, cliente
-- Execute em banco já existente do Sistema Financeiro TodaArte.
-- Regras:
--   se existir perfil 'administrativo', volta para 'administrador'
--   mantém perfis 'administrador', 'usuario' e 'cliente' existentes

UPDATE usuarios SET perfil = 'administrador' WHERE perfil = 'administrativo';

ALTER TABLE usuarios
  MODIFY COLUMN perfil ENUM('root','administrador','usuario','cliente') NOT NULL DEFAULT 'usuario';

