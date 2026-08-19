-- Periodicidade mensal: todo dia X do mês (ex.: 10, 15)
ALTER TABLE checklist_tarefas_fixas
  MODIFY COLUMN periodicidade ENUM('diaria','segunda','terca','quarta','quinta','sexta','mensal') NOT NULL DEFAULT 'diaria';

ALTER TABLE checklist_tarefas_fixas
  ADD COLUMN dia_mes TINYINT UNSIGNED DEFAULT NULL;
