// Pedacos que toda tabela repete: id UUIDv7 gerado pelo Postgres 18, os dois
// carimbos de tempo (atualizado_em e mantido por trigger, ver a migracao
// custom) e a politica de RLS por empresa.
import { sql } from 'drizzle-orm'
import { pgPolicy, pgRole, timestamp, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core'

// A role da aplicacao. Nasce em infra/postgres-init/01-roles.sql, nao aqui;
// `existing()` diz ao drizzle-kit para nao gerar CREATE ROLE.
export const assineaiApp = pgRole('assineai_app').existing()

export const id = uuid()
  .primaryKey()
  .default(sql`uuidv7()`)

export const carimbos = {
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
}

// Politica unica por tabela: a app so ve e so grava linhas da empresa que
// estiver em app.empresa_id (posta por comoEmpresa, em conexao.ts). Sem o
// set_config, current_setting devolve nulo (conexao nova) ou texto vazio
// (conexao do pool que ja teve o valor numa transacao anterior); o nullif
// cobre os dois e nenhuma linha passa.
export const empresaDaSessao = sql`nullif(current_setting('app.empresa_id', true), '')::uuid`

export function politicaDaEmpresa(tabela: string, empresaId: AnyPgColumn) {
  const daEmpresa = sql`${empresaId} = ${empresaDaSessao}`
  return pgPolicy(`${tabela}_da_empresa`, {
    for: 'all',
    to: assineaiApp,
    using: daEmpresa,
    withCheck: daEmpresa,
  })
}
