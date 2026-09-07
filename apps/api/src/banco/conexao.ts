// Conexao da api com o banco, sempre como assineai_app (sem bypass de RLS).
// Quem chama escolhe a URL (config.BANCO_URL); nada aqui le process.env.
import { sql } from 'drizzle-orm'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { z } from 'zod'
import * as esquema from './esquema/index.js'

export type Banco = NodePgDatabase<typeof esquema>
type Transacao = Parameters<Parameters<Banco['transaction']>[0]>[0]

// Banco ja preso a uma empresa. So comoEmpresa produz este tipo: repositorio
// de negocio que pede BancoDaEmpresa nao tem como rodar sem tenant.
declare const marcaDaEmpresa: unique symbol
export type BancoDaEmpresa = Transacao & { readonly [marcaDaEmpresa]: true }

export function criarBanco(url: string) {
  const pool = new Pool({ connectionString: url })

  // Banco sem tenant. Permitido so para o que e global de verdade: achar a
  // empresa no login, checagens de saude, rotinas do sistema. Nas tabelas
  // com RLS ele nao ve linha nenhuma, porque app.empresa_id esta vazio.
  const bancoSistema: Banco = drizzle(pool, { schema: esquema })

  // Abre uma transacao, fixa app.empresa_id nela (set_config local: some no
  // commit ou rollback) e entrega o banco marcado. Toda leitura e escrita
  // dentro de fn passa pelas politicas de RLS filtrando por essa empresa.
  async function comoEmpresa<T>(empresaId: string, fn: (banco: BancoDaEmpresa) => Promise<T>) {
    if (!z.uuid().safeParse(empresaId).success) {
      throw new TypeError(`comoEmpresa precisa do uuid da empresa, recebeu "${empresaId}"`)
    }
    return bancoSistema.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.empresa_id', ${empresaId}, true)`)
      return fn(tx as BancoDaEmpresa)
    })
  }

  return { bancoSistema, comoEmpresa, fechar: () => pool.end() }
}
