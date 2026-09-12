import { jsonb, pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { carimbos, id, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'
import { envelopes, signatariosEnvelope } from './envelope.js'

export const evidencia = pgTable(
  'evidencia',
  {
    id,
    empresaId: uuid('empresa_id')
      .notNull()
      .references(() => empresa.id, { onDelete: 'cascade' }),
    envelopeId: uuid('envelope_id')
      .notNull()
      .references(() => envelopes.id, { onDelete: 'cascade' }),
    signatarioId: uuid('signatario_id')
      .references(() => signatariosEnvelope.id, { onDelete: 'cascade' }),
    tipo: text('tipo').notNull(),
    ipServidor: text('ip_servidor').notNull(),
    userAgent: text('user_agent'),
    mensagemId: text('mensagem_id'),
    canal: text('canal'),
    hashAnterior: text('hash_anterior'),
    hashAtual: text('hash_atual').notNull(),
    dadosDeclarados: jsonb('dados_declarados'),
    horaProvedor: timestamp('hora_provedor', { mode: 'date', withTimezone: true }),
    ...carimbos,
  },
  (t) => [politicaDaEmpresa('evidencia', t.empresaId)],
).enableRLS()
