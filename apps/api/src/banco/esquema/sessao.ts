// Sessao de login: guarda so o hash do token (bytea), quem e de que empresa,
// validade, ultimo uso e revogacao. Apagar o usuario apaga as sessoes dele.
import { customType, index, pgTable, text, timestamp, uuid, inet } from 'drizzle-orm/pg-core'
import { carimbos, id, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'
import { usuario } from './usuario.js'

// o drizzle-orm 0.45 ainda nao tem bytea no pg-core
const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => 'bytea' })

export const sessao = pgTable(
  'sessao',
  {
    id,
    empresaId: uuid('empresa_id')
      .notNull()
      .references(() => empresa.id),
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuario.id, { onDelete: 'cascade' }),
    tokenHash: bytea('token_hash').notNull().unique(),
    expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
    ultimoUsoEm: timestamp('ultimo_uso_em', { withTimezone: true }),
    ip: inet(),
    userAgent: text('user_agent'),
    revogadaEm: timestamp('revogada_em', { withTimezone: true }),
    ...carimbos,
  },
  (t) => [index('sessao_usuario_id_idx').on(t.usuarioId), politicaDaEmpresa('sessao', t.empresaId)],
).enableRLS()
