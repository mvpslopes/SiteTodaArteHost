-- Quem deve executar cada tarefa do checklist
ALTER TABLE checklist_tarefas_fixas
  ADD COLUMN responsavel_id INT UNSIGNED DEFAULT NULL,
  ADD INDEX idx_checklist_responsavel (responsavel_id),
  ADD CONSTRAINT fk_checklist_responsavel
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
