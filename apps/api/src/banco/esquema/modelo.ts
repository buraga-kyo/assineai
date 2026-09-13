import { pgTable, text, uuid, jsonb, boolean } from 'drizzle-orm/pg-core'
import { id, carimbos, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'
import { usuario } from './usuario.js'

export const modeloDocumento = pgTable(
  'modelo_documento',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    criadoPor: uuid('criado_por').references(() => usuario.id, { onDelete: 'set null' }),
    titulo: text('titulo').notNull(),
    blocos: jsonb('blocos').notNull().default('[]'),
    variaveis: jsonb('variaveis').notNull().default('{}'),
    ativo: boolean('ativo').default(true).notNull(),
    ...carimbos,
  },
  (t) => [
    politicaDaEmpresa('modelo_documento', t.empresaId),
  ]
)
