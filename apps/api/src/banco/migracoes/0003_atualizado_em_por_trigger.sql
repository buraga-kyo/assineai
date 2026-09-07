-- Migracao escrita a mao (drizzle-kit generate --custom): mantem atualizado_em
-- por trigger, para nenhum UPDATE precisar lembrar de mexer na coluna.
-- Tabela nova com atualizado_em precisa do proprio CREATE TRIGGER na propria
-- migracao; o drizzle-kit nao sabe gerar trigger.
CREATE OR REPLACE FUNCTION atualiza_atualizado_em() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER empresa_atualizado_em BEFORE UPDATE ON "empresa"
  FOR EACH ROW EXECUTE FUNCTION atualiza_atualizado_em();

CREATE TRIGGER usuario_atualizado_em BEFORE UPDATE ON "usuario"
  FOR EACH ROW EXECUTE FUNCTION atualiza_atualizado_em();

CREATE TRIGGER sessao_atualizado_em BEFORE UPDATE ON "sessao"
  FOR EACH ROW EXECUTE FUNCTION atualiza_atualizado_em();
