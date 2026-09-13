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
ALTER TABLE "modelo_documento" ADD CONSTRAINT "modelo_documento_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "modelo_documento" ADD CONSTRAINT "modelo_documento_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;
CREATE POLICY "modelo_documento_da_empresa" ON "modelo_documento" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("modelo_documento"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("modelo_documento"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);