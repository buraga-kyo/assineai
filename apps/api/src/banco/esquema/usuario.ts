// Quem entra no sistema em nome de uma empresa. Email unico por empresa; o
// papel e texto com CHECK (sem enum do Postgres, que e chato de migrar).
import { sql } from 'drizzle-orm'
import { check, integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { carimbos, id, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'

export const PAPEIS = ['dono', 'agente', 'leitura'] as const
export type Papel = (typeof PAPEIS)[number]

export const usuario = pgTable(
  'usuario',
  {
    id,
    empresaId: uuid('empresa_id')
      .notNull()
      .references(() => empresa.id),
    email: text().notNull(),
    nome: text().notNull(),
    senhaHash: text('senha_hash').notNull(),
    papel: text().$type<Papel>().notNull(),
    emailConfirmadoEm: timestamp('email_confirmado_em', { withTimezone: true }),
    falhasLogin: integer('falhas_login').notNull().default(0),
    bloqueadoAte: timestamp('bloqueado_ate', { withTimezone: true }),
    ...carimbos,
  },
  (t) => [
    unique('usuario_empresa_email_unico').on(t.empresaId, t.email),
    // alvo da FK composta de sessao: sessao so aponta para usuario da mesma empresa
    unique('usuario_empresa_id_unico').on(t.empresaId, t.id),
    check('usuario_papel_check', sql`${t.papel} in ('dono', 'agente', 'leitura')`),
    politicaDaEmpresa('usuario', t.empresaId),
  ],
).enableRLS()
