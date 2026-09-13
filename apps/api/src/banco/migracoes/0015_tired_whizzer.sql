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
ALTER TABLE "obra" ADD CONSTRAINT "obra_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "obra" ADD CONSTRAINT "obra_criado_por_usuario_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;
CREATE POLICY "obra_da_empresa" ON "obra" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("obra"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("obra"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);