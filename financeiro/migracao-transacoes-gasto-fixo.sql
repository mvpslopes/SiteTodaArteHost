-- Liga pagamento (saída) ao gasto fixo do mês
ALTER TABLE transacoes
  ADD COLUMN gasto_fixo_id INT UNSIGNED DEFAULT NULL,
  ADD INDEX idx_transacoes_gasto_fixo (gasto_fixo_id),
  ADD CONSTRAINT fk_transacoes_gasto_fixo
    FOREIGN KEY (gasto_fixo_id) REFERENCES gastos_fixos(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
