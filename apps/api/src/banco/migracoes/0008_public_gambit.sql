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
ALTER TABLE "campos_documento" ADD CONSTRAINT "campos_documento_documento_id_documentos_envelope_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos_envelope"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "campos_documento" ADD CONSTRAINT "campos_documento_signatario_id_signatarios_envelope_id_fk" FOREIGN KEY ("signatario_id") REFERENCES "public"."signatarios_envelope"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "documentos_envelope" ADD CONSTRAINT "documentos_envelope_envelope_id_envelopes_id_fk" FOREIGN KEY ("envelope_id") REFERENCES "public"."envelopes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "envelopes" ADD CONSTRAINT "envelopes_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "signatarios_envelope" ADD CONSTRAINT "signatarios_envelope_envelope_id_envelopes_id_fk" FOREIGN KEY ("envelope_id") REFERENCES "public"."envelopes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_envelope_id_envelopes_id_fk" FOREIGN KEY ("envelope_id") REFERENCES "public"."envelopes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_signatario_id_signatarios_envelope_id_fk" FOREIGN KEY ("signatario_id") REFERENCES "public"."signatarios_envelope"("id") ON DELETE cascade ON UPDATE no action;
CREATE POLICY "envelopes_da_empresa" ON "envelopes" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("envelopes"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("envelopes"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "evidencia_da_empresa" ON "evidencia" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("evidencia"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("evidencia"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);