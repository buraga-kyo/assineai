CREATE TABLE "empresa" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"nome" text NOT NULL,
	"documento_fiscal" text,
	"slug" text NOT NULL,
	"profissao_principal" text,
	"fuso_horario" text DEFAULT 'America/Sao_Paulo' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "empresa_slug_unique" UNIQUE("slug")
);
