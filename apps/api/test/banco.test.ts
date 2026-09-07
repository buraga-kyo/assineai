// Testes contra o Postgres de dev (bash infra/dev.sh up). Precisam de
// BANCO_URL e BANCO_URL_MIGRACAO no ambiente; sem elas sao pulados.
import { sql } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { criarBanco } from '../src/banco/conexao.js'
import { empresa, usuario } from '../src/banco/esquema/index.js'
import { rodarMigracoes } from '../src/banco/migracao.js'
import { capturarLog } from './apoio.js'
import { BANCO_URL, BANCO_URL_MIGRACAO, temBanco } from './config.js'

const rodada = `teste-${Date.now()}`
const dona = criarBanco(BANCO_URL_MIGRACAO ?? '')
const app = criarBanco(BANCO_URL ?? '')
let empresaA = ''
let empresaB = ''

async function criarEmpresa(sufixo: string) {
  const [linha] = await dona.bancoSistema
    .insert(empresa)
    .values({ nome: `Empresa ${sufixo}`, slug: `${rodada}-${sufixo}` })
    .returning({ id: empresa.id })
  return linha!.id
}

async function criarUsuario(empresaId: string, email: string) {
  await dona.bancoSistema
    .insert(usuario)
    .values({ empresaId, email, nome: email, senhaHash: 'x', papel: 'dono' })
}

describe.skipIf(!temBanco)('banco', () => {
  beforeAll(async () => {
    empresaA = await criarEmpresa('a')
    empresaB = await criarEmpresa('b')
    await criarUsuario(empresaA, `a@${rodada}`)
    await criarUsuario(empresaB, `b@${rodada}`)
  })

  afterAll(async () => {
    await dona.bancoSistema.delete(usuario).where(sql`${usuario.email} like ${`%@${rodada}`}`)
    await dona.bancoSistema.delete(empresa).where(sql`${empresa.slug} like ${`${rodada}-%`}`)
    await Promise.all([dona.fechar(), app.fechar()])
  })

  test('migrar duas vezes nao muda nada; as tres tabelas existem', async () => {
    const { logger } = capturarLog()
    await rodarMigracoes(BANCO_URL_MIGRACAO!, logger)
    const aplicadas = await rodarMigracoes(BANCO_URL_MIGRACAO!, logger)
    expect(aplicadas).toBe(0)
    const tabelas = await dona.bancoSistema.execute<{ table_name: string }>(
      sql`select table_name from information_schema.tables where table_schema = 'public'`,
    )
    const nomes = tabelas.rows.map((t) => t.table_name)
    expect(nomes).toEqual(expect.arrayContaining(['empresa', 'usuario', 'sessao']))
  })

  test('comoEmpresa(A) lista so o usuario de A', async () => {
    const emails = await app.comoEmpresa(empresaA, (banco) =>
      banco.select({ email: usuario.email }).from(usuario),
    )
    expect(emails).toEqual([{ email: `a@${rodada}` }])
  })

  test('fora de comoEmpresa a app nao ve usuario nenhum', async () => {
    const linhas = await app.bancoSistema.select().from(usuario)
    expect(linhas).toHaveLength(0)
  })

  test('dentro de A nao da para inserir usuario de B', async () => {
    const tentativa = app.comoEmpresa(empresaA, (banco) =>
      banco.insert(usuario).values({
        empresaId: empresaB,
        email: `c@${rodada}`,
        nome: 'c',
        senhaHash: 'x',
        papel: 'dono',
      }),
    )
    // o drizzle embrulha o erro do pg; o codigo 42501 e a violacao da politica
    await expect(tentativa).rejects.toMatchObject({
      cause: { code: '42501', message: expect.stringContaining('row-level security') },
    })
  })

})
