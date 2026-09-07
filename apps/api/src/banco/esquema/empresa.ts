// A empresa e o tenant: tudo que e de negocio pende dela por empresa_id.
// Sem RLS por enquanto: o login precisa achar a empresa antes de ter tenant.
import { jsonb, pgTable, text } from 'drizzle-orm/pg-core'
import { carimbos, id } from './comum.js'

export const empresa = pgTable('empresa', {
  id,
  nome: text().notNull(),
  documentoFiscal: text('documento_fiscal'),
  slug: text().notNull().unique(),
  profissaoPrincipal: text('profissao_principal'),
  fusoHorario: text('fuso_horario').notNull().default('America/Sao_Paulo'),
  config: jsonb().notNull().default({}),
  ...carimbos,
})
