-- Perfil freelancer: login próprio para receber e executar jobs de produção.
-- Em produção o PHP também aplica este ALTER na primeira chamada da API.

ALTER TABLE usuarios
  MODIFY COLUMN perfil ENUM('root','administrador','usuario','cliente','freelancer') NOT NULL DEFAULT 'usuario';
