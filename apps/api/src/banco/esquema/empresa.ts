// A empresa e o tenant: tudo que e de negocio pende dela por empresa_id.
// RLS minima: a app le qualquer empresa (o login acha a empresa antes de ter
// tenant) e cadastra empresa nova, mas so altera a propria; nao apaga nenhuma.
import { sql } from 'drizzle-orm'
import { jsonb, pgPolicy, pgTable, text } from 'drizzle-orm/pg-core'
import { assineaiApp, carimbos, empresaDaSessao, id } from './comum.js'

export const empresa = pgTable(
  'empresa',
  {
    id,
    nome: text().notNull(),
    documentoFiscal: text('documento_fiscal'),
    slug: text().notNull().unique(),
    profissaoPrincipal: text('profissao_principal'),
    fusoHorario: text('fuso_horario').notNull().default('America/Sao_Paulo'),
    config: jsonb().notNull().default({}),
    ...carimbos,
  },
  (t) => [
    pgPolicy('empresa_leitura', { for: 'select', to: assineaiApp, using: sql`true` }),
    pgPolicy('empresa_criar', { for: 'insert', to: assineaiApp, withCheck: sql`true` }),
    pgPolicy('empresa_propria', {
      for: 'update',
      to: assineaiApp,
      using: sql`${t.id} = ${empresaDaSessao}`,
      withCheck: sql`${t.id} = ${empresaDaSessao}`,
    }),
  ],
).enableRLS()
