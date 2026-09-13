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
ALTER TABLE "conversa" ADD CONSTRAINT "conversa_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversa" ADD CONSTRAINT "conversa_contato_id_contato_id_fk" FOREIGN KEY ("contato_id") REFERENCES "public"."contato"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversa" ADD CONSTRAINT "conversa_canal_id_canal_id_fk" FOREIGN KEY ("canal_id") REFERENCES "public"."canal"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversa" ADD CONSTRAINT "conversa_atribuida_a_usuario_id_fk" FOREIGN KEY ("atribuida_a") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "mensagem" ADD CONSTRAINT "mensagem_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "mensagem" ADD CONSTRAINT "mensagem_conversa_id_conversa_id_fk" FOREIGN KEY ("conversa_id") REFERENCES "public"."conversa"("id") ON DELETE cascade ON UPDATE no action;
CREATE POLICY "conversa_da_empresa" ON "conversa" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("conversa"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("conversa"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);
CREATE POLICY "mensagem_da_empresa" ON "mensagem" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("mensagem"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("mensagem"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);