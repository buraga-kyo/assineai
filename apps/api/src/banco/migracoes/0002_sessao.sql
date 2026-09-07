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
ALTER TABLE "sessao" ADD CONSTRAINT "sessao_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sessao" ADD CONSTRAINT "sessao_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "sessao_usuario_id_idx" ON "sessao" USING btree ("usuario_id");
CREATE POLICY "sessao_da_empresa" ON "sessao" AS PERMISSIVE FOR ALL TO "assineai_app" USING ("sessao"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid) WITH CHECK ("sessao"."empresa_id" = nullif(current_setting('app.empresa_id', true), '')::uuid);