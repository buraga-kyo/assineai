import { pgTable, text, uuid, jsonb, boolean } from 'drizzle-orm/pg-core'
import { id, carimbos, politicaDaEmpresa } from './comum.js'
import { empresa } from './empresa.js'
import { sql } from 'drizzle-orm'
import { check, unique } from 'drizzle-orm/pg-core'

export const CANAIS = ['telegram', 'whatsapp_evolution', 'whatsapp_meta', 'slack'] as const
export type TipoCanal = (typeof CANAIS)[number]

export const ESTADOS_CANAL = ['desconectado', 'pareando', 'conectado', 'erro'] as const
export type EstadoCanal = (typeof ESTADOS_CANAL)[number]

export const canal = pgTable(
  'canal',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    tipo: text('tipo').$type<TipoCanal>().notNull(),
    estado: text('estado').$type<EstadoCanal>().notNull().default('desconectado'),
    // Credenciais simétricas criptografadas (AES-256-GCM), o IV e a tag estão embutidos ou separados (aqui embutidos no formato buffer hex ou base64)
    credenciaisCifradas: text('credenciais_cifradas'),
    webhookSegredo: text('webhook_segredo'),
    metadados: jsonb('metadados').default('{}'),
    ...carimbos,
  },
  (t) => [
    unique('canal_empresa_tipo_unico').on(t.empresaId, t.tipo),
    check('canal_tipo_check', sql`${t.tipo} in ('telegram', 'whatsapp_evolution', 'whatsapp_meta', 'slack')`),
    check('canal_estado_check', sql`${t.estado} in ('desconectado', 'pareando', 'conectado', 'erro')`),
    politicaDaEmpresa('canal', t.empresaId),
  ]
)

export const contatoCanal = pgTable(
  'contato_canal',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    canalId: uuid('canal_id').notNull().references(() => canal.id, { onDelete: 'cascade' }),
    // Pode ser o ID do usuário no telegram, número do zap, ou ID do slack
    identidadeExterna: text('identidade_externa').notNull(),
    nome: text('nome'),
    ...carimbos,
  },
  (t) => [
    unique('contato_canal_unico').on(t.canalId, t.identidadeExterna),
    politicaDaEmpresa('contato_canal', t.empresaId),
  ]
)

export const eventoWebhook = pgTable(
  'evento_webhook',
  {
    id,
    empresaId: uuid('empresa_id').notNull().references(() => empresa.id, { onDelete: 'cascade' }),
    canalId: uuid('canal_id').notNull().references(() => canal.id, { onDelete: 'cascade' }),
    payload: jsonb('payload').notNull(),
    processado: boolean('processado').default(false).notNull(),
    ...carimbos,
  },
  (t) => [
    politicaDaEmpresa('evento_webhook', t.empresaId),
  ]
)
