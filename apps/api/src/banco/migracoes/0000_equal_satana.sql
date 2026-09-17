CREATE TABLE "empresa" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"nome" text NOT NULL,
	"documento_fiscal" text,
	"slug" text NOT NULL,
	"profissao_principal" text,
	"fuso_horario" text DEFAULT 'America/Sao_Paulo' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tema" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "empresa_slug_unique" UNIQUE("slug")
);

ALTER TABLE "empresa" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"email" text NOT NULL,
	"nome" text NOT NULL,
	"senha_hash" text NOT NULL,
	"papel" text NOT NULL,
	"email_confirmado_em" timestamp with time zone,
	"falhas_login" integer DEFAULT 0 NOT NULL,
	"bloqueado_ate" timestamp with time zone,
	"preferencias_notificacao" jsonb DEFAULT '{}',
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_empresa_email_unico" UNIQUE("empresa_id","email"),
	CONSTRAINT "usuario_empresa_id_unico" UNIQUE("empresa_id","id"),
	CONSTRAINT "usuario_papel_check" CHECK ("usuario"."papel" in ('dono', 'agente', 'leitura'))
);

ALTER TABLE "usuario" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "sessao" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"token_hash" "bytea" NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"ultimo_uso_em" timestamp with time zone,
	"ip" "inet",
	"user_agent" text,
	"revogada_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessao_token_hash_unique" UNIQUE("token_hash")
);

ALTER TABLE "sessao" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "campos_documento" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"documento_id" uuid NOT NULL,
	"signatario_id" uuid,
	"tipo" text NOT NULL,
	"pagina" integer NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"valor" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "documentos_envelope" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"envelope_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"caminho_storage" text NOT NULL,
	"hash_original" text,
	"hash_composto" text,
	"hash_final" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "envelopes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"codigo_publico" text,
	"titulo" text NOT NULL,
	"estado" text DEFAULT 'rascunho' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "envelopes_codigo_publico_unique" UNIQUE("codigo_publico")
);

ALTER TABLE "envelopes" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "signatarios_envelope" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"envelope_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"estado" text DEFAULT 'pendente' NOT NULL,
	"ordem" integer DEFAULT 1 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "evidencia" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"envelope_id" uuid NOT NULL,
	"signatario_id" uuid,
	"tipo" text NOT NULL,
	"ip_servidor" text NOT NULL,
	"user_agent" text,
	"mensagem_id" text,
	"canal" text,
	"hash_anterior" text,
	"hash_atual" text NOT NULL,
	"dados_declarados" jsonb,
	"hora_provedor" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "evidencia" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "canal" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"estado" text DEFAULT 'desconectado' NOT NULL,
	"credenciais_cifradas" text,
	"webhook_segredo" text,
	"metadados" jsonb DEFAULT '{}',
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "canal_empresa_tipo_unico" UNIQUE("empresa_id","tipo"),
	CONSTRAINT "canal_tipo_check" CHECK ("canal"."tipo" in ('telegram', 'whatsapp_evolution', 'whatsapp_meta', 'slack')),
	CONSTRAINT "canal_estado_check" CHECK ("canal"."estado" in ('desconectado', 'pareando', 'conectado', 'erro'))
);

ALTER TABLE "canal" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "contato_canal" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"contato_id" uuid NOT NULL,
	"canal_id" uuid NOT NULL,
	"identidade_externa" text NOT NULL,
	"nome" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contato_canal_unico" UNIQUE("canal_id","identidade_externa")
);

ALTER TABLE "contato_canal" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "evento_webhook" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"canal_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"processado" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "evento_webhook" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "contato" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"telefone" text,
	"email" text,
	"notas" text,
	"lgpd_apagado" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "contato" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "contato_etiqueta" (
	"contato_id" uuid NOT NULL,
	"etiqueta_id" uuid NOT NULL
);

CREATE TABLE "etiqueta" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"cor" text DEFAULT '#CCCCCC' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "etiqueta_empresa_nome_unico" UNIQUE("empresa_id","nome")
);

ALTER TABLE "etiqueta" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "conversa" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"contato_id" uuid NOT NULL,
	"canal_id" uuid NOT NULL,
	"atribuida_a" uuid,
	"estado" text DEFAULT 'aberta' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "conversa" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "mensagem" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"conversa_id" uuid NOT NULL,
	"texto" text NOT NULL,
	"enviada_por_nos" boolean DEFAULT false NOT NULL,
	"lida" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "mensagem" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "modelo_documento" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"criado_por" uuid,
	"titulo" text NOT NULL,
	"blocos" jsonb DEFAULT '[]' NOT NULL,
	"variaveis" jsonb DEFAULT '{}' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "modelo_documento" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "obra" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"criado_por" uuid,
	"titulo" text NOT NULL,
	"codigo_publico" text NOT NULL,
	"arquivos" jsonb DEFAULT '[]' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "obra_codigo_publico_unique" UNIQUE("codigo_publico")
);

ALTER TABLE "obra" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sessao" ADD CONSTRAINT "sessao_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sessao" ADD CONSTRAINT "sessao_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sessao" ADD CONSTRAINT "sessao_usuario_da_empresa_fk" FOREIGN KEY ("empresa_id","usuario_id") REFERENCES "public"."usuario"("empresa_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "campos_documento" ADD CONSTRAINT "campos_documento_documento_id_documentos_envelope_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos_envelope"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "campos_documento" ADD CONSTRAINT "campos_documento_signatario_id_signatarios_envelope_id_fk" FOREIGN KEY ("signatario_id") REFERENCES "public"."signatarios_envelope"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "documentos_envelope" ADD CONSTRAINT "documentos_envelope_envelope_id_envelopes_id_fk" FOREIGN KEY ("envelope_id") REFERENCES "public"."envelopes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "envelopes" ADD CONSTRAINT "envelopes_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "signatarios_envelope" ADD CONSTRAINT "signatarios_envelope_envelope_id_envelopes_id_fk" FOREIGN KEY ("envelope_id") REFERENCES "public"."envelopes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_envelope_id_envelopes_id_fk" FOREIGN KEY ("envelope_id") REFERENCES "public"."envelopes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_signatario_id_signatarios_envelope_id_fk" FOREIGN KEY ("signatario_id") REFERENCES "public"."signatarios_envelope"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "canal" ADD CONSTRAINT "canal_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contato_canal" ADD CONSTRAINT "contato_canal_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contato_canal" ADD CONSTRAINT "contato_canal_contato_id_contato_id_fk" FOREIGN KEY ("contato_id") REFERENCES "public"."contato"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contato_canal" ADD CONSTRAINT "contato_canal_canal_id_canal_id_fk" FOREIGN KEY ("canal_id") REFERENCES "public"."canal"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evento_webhook" ADD CONSTRAINT "evento_webhook_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evento_webhook" ADD CONSTRAINT "evento_webhook_canal_id_canal_id_fk" FOREIGN KEY ("canal_id") REFERENCES "public"."canal"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contato" ADD CONSTRAINT "contato_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contato_etiqueta" ADD CONSTRAINT "contato_etiqueta_contato_id_contato_id_fk" FOREIGN KEY ("contato_id") REFERENCES "public"."contato"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contato_etiqueta" ADD CONSTRAINT "contato_etiqueta_etiqueta_id_etiqueta_id_fk" FOREIGN KEY ("etiqueta_id") REFERENCES "public"."etiqueta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "etiqueta" ADD CONSTRAINT "etiqueta_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversa" ADD CONSTRAINT "conversa_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversa" ADD CONSTRAINT "conversa_contato_id_contato_id_fk" FOREIGN KEY ("contato_id") REFERENCES "public"."contato"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversa" ADD CONSTRAINT "conversa_canal_id_canal_id_fk" FOREIGN KEY ("canal_id") REFERENCES "public"."canal"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversa" ADD CONSTRAINT "conversa_atribuida_a_usuario_id_fk" FOREIGN KEY ("atribuida_a") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "mensagem" ADD CONSTRAINT "mensagem_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "mensagem" ADD CONSTRAINT "mensagem_conversa_id_conversa_id_fk" FOREIGN KEY ("conversa_id") REFERENCES "public"."conversa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "modelo_documento" ADD CONSTRAINT "modelo_documento_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "modelo_documento" ADD CONSTRAINT "modelo_documento_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "obra" ADD CONSTRAINT "obra_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "obra" ADD CONSTRAINT "obra_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "sessao_usuario_id_idx" ON "sessao" USING btree ("usuario_id");
CREATE POLICY "empresa_leitura" ON "empresa" AS PERMISSIVE FOR SELECT TO "assineai_app" USING (true);
CREATE POLICY "empresa_criar" ON "empresa" AS PERMISSIVE FOR INSERT TO "assineai_app" WITH CHECK (true);
CREATE POLICY "empresa_propria" ON "empresa" AS PERMISSIVE FOR UPDATE TO "assineai_app" USING ("empresa"."id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("empresa"."id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "usuario_da_empresa" ON "usuario" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("usuario"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("usuario"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "sessao_da_empresa" ON "sessao" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("sessao"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("sessao"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "envelopes_da_empresa" ON "envelopes" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("envelopes"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("envelopes"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "evidencia_da_empresa" ON "evidencia" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("evidencia"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("evidencia"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "canal_da_empresa" ON "canal" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("canal"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("canal"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "contato_canal_da_empresa" ON "contato_canal" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("contato_canal"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("contato_canal"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "evento_webhook_da_empresa" ON "evento_webhook" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("evento_webhook"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("evento_webhook"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "contato_da_empresa" ON "contato" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("contato"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("contato"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "etiqueta_da_empresa" ON "etiqueta" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("etiqueta"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("etiqueta"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "conversa_da_empresa" ON "conversa" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("conversa"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("conversa"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "mensagem_da_empresa" ON "mensagem" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("mensagem"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("mensagem"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "modelo_documento_da_empresa" ON "modelo_documento" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("modelo_documento"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("modelo_documento"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "obra_da_empresa" ON "obra" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("obra"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("obra"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);-- Migracao escrita a mao (drizzle-kit generate --custom): mantem atualizado_em
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
CREATE OR REPLACE FUNCTION buscar_usuario_sistema(p_email text)
RETURNS TABLE (
  id uuid,
  empresa_id uuid,
  email text,
  senha_hash text,
  papel text,
  falhas_login integer,
  bloqueado_ate timestamp with time zone
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT u.id, u.empresa_id, u.email, u.senha_hash, u.papel, u.falhas_login, u.bloqueado_ate
  FROM "usuario" u
  WHERE LOWER(u.email) = LOWER(p_email);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION buscar_sessao_sistema(p_hash bytea)
RETURNS TABLE (
  id uuid,
  empresa_id uuid,
  usuario_id uuid,
  expira_em timestamp with time zone,
  revogada_em timestamp with time zone
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT s.id, s.empresa_id, s.usuario_id, s.expira_em, s.revogada_em
  FROM "sessao" s
  WHERE s.token_hash = p_hash;
END;
$$ LANGUAGE plpgsql;
