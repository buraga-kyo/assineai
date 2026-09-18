CREATE TABLE "certificado" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"caminho_storage" text NOT NULL,
	"senha_cifrada" text NOT NULL,
	"valido_ate" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "certificado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
CREATE POLICY "certificado_da_empresa" ON "certificado" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("certificado"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("certificado"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);