-- Inserir/atualizar usuário Root do Sistema Financeiro TodaArte
-- Execute no phpMyAdmin no banco u179630068_todaarte_bd (após ter a tabela usuarios)
--
-- Email: marcus.lopes@todaarte.com.br
-- Senha: *.Admin14!

INSERT INTO usuarios (email, password_hash, nome, perfil, ativo) VALUES
('marcus.lopes@todaarte.com.br', '$2a$12$SFkTfB6T0BHahCraxl2d1eWgd/exHAfXmYMRsDQUKUDUSKQiQvhUa', 'Marcus Lopes', 'root', 1)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nome = VALUES(nome), perfil = 'root';
