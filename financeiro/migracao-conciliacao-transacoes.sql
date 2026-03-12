-- Migração: campo de conciliação nas transações
-- Execute este script no banco já existente do Sistema Financeiro TodaArte.

ALTER TABLE transacoes
  ADD COLUMN IF NOT EXISTS conciliada TINYINT(1) NOT NULL DEFAULT 0;

