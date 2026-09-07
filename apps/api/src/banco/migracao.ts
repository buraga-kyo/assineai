// Roda as migrations da pasta migracoes/ como a role dona (assineai_migracao).
// E o unico caminho que cria ou altera esquema: a api nunca faz isso no boot.
import { sql } from 'drizzle-orm'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'
import type { Logger } from 'pino'

// A pasta fica ao lado deste arquivo tanto em src (tsx) quanto em dist (o
// build copia o SQL para la).
export const PASTA_MIGRACOES = fileURLToPath(new URL('./migracoes', import.meta.url))

export async function rodarMigracoes(url: string, log: Logger, pasta = PASTA_MIGRACOES) {
  const pool = new Pool({ connectionString: url, max: 1 })
  const banco = drizzle(pool)
  try {
    const arquivos = readMigrationFiles({ migrationsFolder: pasta })
    const nomes = lerNomes(pasta)
    const nome = (quando: number) => nomes.get(quando) ?? String(quando)
    const antes = await ultimaAplicada(banco)
    const pendentes = arquivos
      .filter((m) => m.folderMillis > antes)
      .map((m) => nome(m.folderMillis))
    log.info({ total: arquivos.length, pendentes }, 'migracoes lidas')
    await migrate(banco, { migrationsFolder: pasta })
    // o que foi aplicado de fato e o que a tabela de controle ganhou
    const depois = await ultimaAplicada(banco)
    const aplicadas = arquivos
      .filter((m) => m.folderMillis > antes && m.folderMillis <= depois)
      .map((m) => nome(m.folderMillis))
    log.info({ aplicadas }, 'migracoes concluidas')
    return aplicadas.length
  } finally {
    await pool.end()
  }
}

// O journal do drizzle-kit liga o instante de cada migracao ao nome do arquivo.
function lerNomes(pasta: string) {
  const journal = JSON.parse(readFileSync(join(pasta, 'meta', '_journal.json'), 'utf8')) as {
    entries: { when: number; tag: string }[]
  }
  return new Map(journal.entries.map((e) => [e.when, e.tag]))
}

// created_at da tabela de controle do drizzle e o `when` do journal. Sem a
// tabela (banco vazio) tudo esta pendente.
async function ultimaAplicada(banco: ReturnType<typeof drizzle>) {
  const existe = await banco.execute<{ ok: boolean }>(
    sql`select to_regclass('drizzle.__drizzle_migrations') is not null as ok`,
  )
  if (!existe.rows[0]?.ok) return -1
  const r = await banco.execute<{ ultima: string | null }>(
    sql`select max(created_at)::text as ultima from drizzle.__drizzle_migrations`,
  )
  return Number(r.rows[0]?.ultima ?? -1)
}
