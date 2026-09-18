import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { id, carimbos, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'

export const certificado = pgTable(
  'certificado',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    caminhoStorage: text('caminho_storage').notNull(),
    senhaCifrada: text('senha_cifrada').notNull(),
    validoAte: timestamp('valido_ate', { withTimezone: true }),
    ...carimbos,
  },
  (t) => [
    politicaDaEmpresa('certificado', t.empresaId),
  ]
)
