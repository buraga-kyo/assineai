#!/usr/bin/env bash
# Roles de PRODUCAO do AssineAi. O entrypoint do Postgres roda este arquivo uma
# vez, no primeiro boot do volume, com as variaveis de ambiente do container.
# Mesmas roles, dono, grants e DEFAULT PRIVILEGES do 01-roles.sql de dev, mas
# as senhas vem do .env de producao (infra/.env.prod.example tem os nomes).
# As senhas entram no psql por variavel (:'var'), nunca coladas no SQL.
set -euo pipefail

: "${ASSINEAI_MIGRACAO_SENHA:?defina ASSINEAI_MIGRACAO_SENHA no .env de producao (senha da role dona)}"
: "${ASSINEAI_APP_SENHA:?defina ASSINEAI_APP_SENHA no .env de producao (senha da role da aplicacao)}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v banco="$POSTGRES_DB" \
  -v senha_migracao="$ASSINEAI_MIGRACAO_SENHA" \
  -v senha_app="$ASSINEAI_APP_SENHA" <<'EOSQL'
-- Dona do banco: roda as migrations, cria tabelas, indices e politicas de RLS.
CREATE ROLE assineai_migracao LOGIN PASSWORD :'senha_migracao'
  NOSUPERUSER NOCREATEDB NOCREATEROLE;
ALTER DATABASE :"banco" OWNER TO assineai_migracao;

-- A aplicacao: sem bypass de RLS, sem criar banco, sem superusuario.
CREATE ROLE assineai_app LOGIN PASSWORD :'senha_app'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
GRANT CONNECT ON DATABASE :"banco" TO assineai_app;
GRANT USAGE ON SCHEMA public TO assineai_app;

-- O que a migracao criar no schema public ja nasce acessivel pela app.
ALTER DEFAULT PRIVILEGES FOR ROLE assineai_migracao IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO assineai_app;
ALTER DEFAULT PRIVILEGES FOR ROLE assineai_migracao IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO assineai_app;
ALTER DEFAULT PRIVILEGES FOR ROLE assineai_migracao IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO assineai_app;
EOSQL
echo "roles assineai_migracao e assineai_app criadas com as senhas do ambiente"
