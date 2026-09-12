import { pgTable, text, uuid, jsonb, boolean } from 'drizzle-orm/pg-core'
import { id, carimbos, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'
import { unique } from 'drizzle-orm/pg-core'

export const contato = pgTable(
  'contato',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    nome: text('nome').notNull(),
    telefone: text('telefone'),
    email: text('email'),
    notas: text('notas'),
    lgpdApagado: boolean('lgpd_apagado').default(false).notNull(),
    ...carimbos,
  },
  (t) => [
    politicaDaEmpresa('contato', t.empresaId),
  ]
)

export const etiqueta = pgTable(
  'etiqueta',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    nome: text('nome').notNull(),
    cor: text('cor').default('#CCCCCC').notNull(),
    ...carimbos,
  },
  (t) => [
    unique('etiqueta_empresa_nome_unico').on(t.empresaId, t.nome),
    politicaDaEmpresa('etiqueta', t.empresaId),
  ]
)

export const contatoEtiqueta = pgTable(
  'contato_etiqueta',
  {
    contatoId: uuid('contato_id').notNull().references(() => contato.id, { onDelete: 'cascade' }),
    etiquetaId: uuid('etiqueta_id').notNull().references(() => etiqueta.id, { onDelete: 'cascade' }),
  }
)
