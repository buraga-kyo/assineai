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
ALTER TABLE "evento_webhook" ADD CONSTRAINT "evento_webhook_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evento_webhook" ADD CONSTRAINT "evento_webhook_canal_id_canal_id_fk" FOREIGN KEY ("canal_id") REFERENCES "public"."canal"("id") ON DELETE cascade ON UPDATE no action;
CREATE POLICY "evento_webhook_da_empresa" ON "evento_webhook" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("evento_webhook"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("evento_webhook"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);