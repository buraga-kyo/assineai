-- Ordem corrigida a mao: o drizzle-kit gerou a FK antes do UNIQUE que ela
-- referencia, e o Postgres recusa (42830). O unique vem primeiro.
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_unico" UNIQUE("empresa_id","id");
ALTER TABLE "sessao" ADD CONSTRAINT "sessao_usuario_da_empresa_fk" FOREIGN KEY ("empresa_id","usuario_id") REFERENCES "public"."usuario"("empresa_id","id") ON DELETE no action ON UPDATE no action;
