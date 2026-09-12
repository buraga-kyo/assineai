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
ALTER TABLE "contato" ADD CONSTRAINT "contato_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contato_etiqueta" ADD CONSTRAINT "contato_etiqueta_contato_id_contato_id_fk" FOREIGN KEY ("contato_id") REFERENCES "public"."contato"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contato_etiqueta" ADD CONSTRAINT "contato_etiqueta_etiqueta_id_etiqueta_id_fk" FOREIGN KEY ("etiqueta_id") REFERENCES "public"."etiqueta"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "etiqueta" ADD CONSTRAINT "etiqueta_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
CREATE POLICY "contato_da_empresa" ON "contato" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("contato"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("contato"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "etiqueta_da_empresa" ON "etiqueta" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("etiqueta"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("etiqueta"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);