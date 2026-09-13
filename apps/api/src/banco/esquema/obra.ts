import { pgTable, text, uuid, boolean, jsonb } from 'drizzle-orm/pg-core'
import { id, carimbos, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'
import { usuario } from './usuario.js'
import { unique } from 'drizzle-orm/pg-core'

export const obra = pgTable(
  'obra',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    criadoPor: uuid('criado_por').references(() => usuario.id, { onDelete: 'set null' }),
    titulo: text('titulo').notNull(),
    codigoPublico: text('codigo_publico').notNull().unique(), // Ex: OBR-1234
    
    // Armazena informações dos arquivos anexados: { tipo: 'audio' | 'letra', hash: string, caminho: string, otsCaminho: string, ancorado: boolean }
    arquivos: jsonb('arquivos').notNull().default('[]'),
    
    ...carimbos,
  },
  (t) => [
    politicaDaEmpresa('obra', t.empresaId),
  ]
)
