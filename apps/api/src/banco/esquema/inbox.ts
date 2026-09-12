import { pgTable, text, uuid, boolean } from 'drizzle-orm/pg-core'
import { id, carimbos, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'
import { usuario } from './usuario.js'
import { contato } from './contato.js'
import { canal } from './canais.js'

export const conversa = pgTable(
  'conversa',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    contatoId: uuid('contato_id').notNull().references(() => contato.id, { onDelete: 'cascade' }),
    canalId: uuid('canal_id').notNull().references(() => canal.id, { onDelete: 'cascade' }),
    atribuidaA: uuid('atribuida_a').references(() => usuario.id, { onDelete: 'set null' }),
    estado: text('estado').notNull().default('aberta'), // aberta, pendente, resolvida
    ...carimbos,
  },
  (t) => [
    politicaDaEmpresa('conversa', t.empresaId),
  ]
)

export const mensagem = pgTable(
  'mensagem',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    conversaId: uuid('conversa_id').notNull().references(() => conversa.id, { onDelete: 'cascade' }),
    texto: text('texto').notNull(),
    enviadaPorNos: boolean('enviada_por_nos').default(false).notNull(),
    lida: boolean('lida').default(false).notNull(),
    ...carimbos,
  },
  (t) => [
    politicaDaEmpresa('mensagem', t.empresaId),
  ]
)
