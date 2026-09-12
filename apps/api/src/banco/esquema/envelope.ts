import { sql } from 'drizzle-orm'
import { pgTable, text, uuid, integer } from 'drizzle-orm/pg-core'
import { id, carimbos, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'

export const envelopes = pgTable(
  'envelopes',
  {
    id,
    empresaId: uuid('empresa_id')
      .notNull()
      .references(() => empresa.id, { onDelete: 'cascade' }),
    codigoPublico: text('codigo_publico').unique(),
    titulo: text('titulo').notNull(),
    estado: text('estado').notNull().$type<'rascunho' | 'pendente' | 'assinado' | 'cancelado'>().default('rascunho'),
    ...carimbos,
  },
  (t) => [politicaDaEmpresa('envelopes', t.empresaId)],
).enableRLS()

export const documentosEnvelope = pgTable(
  'documentos_envelope',
  {
    id,
    envelopeId: uuid('envelope_id')
      .notNull()
      .references(() => envelopes.id, { onDelete: 'cascade' }),
    nome: text('nome').notNull(),
    caminhoStorage: text('caminho_storage').notNull(),
    hash: text('hash'),
    ...carimbos,
  }
  // Podemos não colocar RLS direto ou colocar usando um join, mas o comum é assumir que o tenant está no envelope e fazer query join ou confiar no envelope_id.
  // Como a regra de política do Drizzle não permite JOIN facilmente sem funções, geralmente colocamos empresaId também nas filhas ou ignoramos e conferimos na app.
)

export const signatariosEnvelope = pgTable(
  'signatarios_envelope',
  {
    id,
    envelopeId: uuid('envelope_id')
      .notNull()
      .references(() => envelopes.id, { onDelete: 'cascade' }),
    nome: text('nome').notNull(),
    email: text('email').notNull(),
    estado: text('estado').notNull().$type<'pendente' | 'assinado' | 'recusado'>().default('pendente'),
    ordem: integer('ordem').notNull().default(1),
    ...carimbos,
  }
)

export const camposDocumento = pgTable(
  'campos_documento',
  {
    id,
    documentoId: uuid('documento_id')
      .notNull()
      .references(() => documentosEnvelope.id, { onDelete: 'cascade' }),
    signatarioId: uuid('signatario_id')
      .references(() => signatariosEnvelope.id, { onDelete: 'cascade' }), // pode ser nulo se o campo não estiver assinado ainda, ou not null se já for atrelado
    tipo: text('tipo').notNull().$type<'assinatura' | 'texto' | 'data'>(),
    pagina: integer('pagina').notNull(),
    x: integer('x').notNull(),
    y: integer('y').notNull(),
    valor: text('valor'),
    ...carimbos,
  }
)
