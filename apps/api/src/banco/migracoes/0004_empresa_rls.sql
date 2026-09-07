ALTER TABLE "empresa" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "empresa_leitura" ON "empresa" AS PERMISSIVE FOR SELECT TO "assineai_app" USING (true);
CREATE POLICY "empresa_criar" ON "empresa" AS PERMISSIVE FOR INSERT TO "assineai_app" WITH CHECK (true);
CREATE POLICY "empresa_propria" ON "empresa" AS PERMISSIVE FOR UPDATE TO "assineai_app" USING ("empresa"."id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("empresa"."id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
-- Escrito a mao (o drizzle-kit nao acompanha funcao): a funcao do trigger de
-- atualizado_em passa a resolver nomes so no pg_catalog, para ninguem
-- redirecionar o now() dela por um search_path malicioso.
ALTER FUNCTION atualiza_atualizado_em() SET search_path = pg_catalog;
