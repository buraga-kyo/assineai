-- Roles de desenvolvimento do AssineAi. O entrypoint do Postgres roda este
-- arquivo uma vez, no primeiro boot do volume, como superusuário e já
-- conectado ao banco assineai (criado pelo POSTGRES_DB do compose).
-- Mudou algo aqui? `bash infra/dev.sh down --volumes` e suba de novo.
--
-- Senhas de desenvolvimento, iguais às do .env.example da raiz. Em produção
-- as senhas vêm de secrets do ambiente, nunca deste arquivo.

-- Dona do banco: roda as migrations, cria tabelas, índices e políticas de RLS.
CREATE ROLE assineai_migracao LOGIN PASSWORD 'migracao_dev'
  NOSUPERUSER NOCREATEDB NOCREATEROLE;
ALTER DATABASE assineai OWNER TO assineai_migracao;

-- A aplicação: sem bypass de RLS, sem criar banco, sem superusuário.
-- As políticas de RLS valem para ela justamente porque não é dona das tabelas.
CREATE ROLE assineai_app LOGIN PASSWORD 'app_dev'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
GRANT CONNECT ON DATABASE assineai TO assineai_app;
GRANT USAGE ON SCHEMA public TO assineai_app;

-- O que a migração criar no schema public já nasce acessível pela app
-- (tabelas, sequências, funções); a app não ganha CREATE em lugar nenhum.
ALTER DEFAULT PRIVILEGES FOR ROLE assineai_migracao IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO assineai_app;
ALTER DEFAULT PRIVILEGES FOR ROLE assineai_migracao IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO assineai_app;
ALTER DEFAULT PRIVILEGES FOR ROLE assineai_migracao IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO assineai_app;
