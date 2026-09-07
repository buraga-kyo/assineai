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
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_empresa_email_unico" UNIQUE("empresa_id","email"),
	CONSTRAINT "usuario_papel_check" CHECK ("usuario"."papel" in ('dono', 'agente', 'leitura'))
);

ALTER TABLE "usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE no action ON UPDATE no action;
CREATE POLICY "usuario_da_empresa" ON "usuario" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("usuario"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("usuario"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);