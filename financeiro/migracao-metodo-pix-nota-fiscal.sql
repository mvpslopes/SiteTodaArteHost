-- Inclui o método de pagamento "Pix / Nota Fiscal" (valor: pix_nota_fiscal).
-- Execute este script no banco existente se a tabela transacoes já foi criada.

ALTER TABLE transacoes
  MODIFY COLUMN metodo_pagamento ENUM('pix','boleto','ted','dinheiro','cheque','pix_nota_fiscal') NOT NULL;
