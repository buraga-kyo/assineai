// Testes contra o Postgres de dev (bash infra/dev.sh up). Precisam de
// BANCO_URL e BANCO_URL_MIGRACAO no ambiente; sem elas sao pulados.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { eq, sql } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { criarBanco } from '../src/banco/conexao.js'
import { empresa, usuario } from '../src/banco/esquema/index.js'
import { rodarMigracoes } from '../src/banco/migracao.js'
import { capturarLog } from './apoio.js'
import { ambiente, BANCO_URL, BANCO_URL_MIGRACAO, temBanco } from './config.js'

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

  test('a app le qualquer empresa mesmo sem tenant', async () => {
    const slugs = await app.bancoSistema
      .select({ slug: empresa.slug })
      .from(empresa)
      .where(sql`${empresa.slug} like ${`${rodada}-%`}`)
    expect(slugs.map((e) => e.slug).sort()).toEqual([`${rodada}-a`, `${rodada}-b`])
  })

  test('dentro de A, alterar a empresa B nao pega linha nenhuma', async () => {
    const alteradas = await app.comoEmpresa(empresaA, (banco) =>
      banco.update(empresa).set({ nome: 'invadida' }).where(eq(empresa.id, empresaB)).returning(),
    )
    expect(alteradas).toEqual([])
    const [b] = await dona.bancoSistema.select().from(empresa).where(eq(empresa.id, empresaB))
    expect(b!.nome).toBe('Empresa b')
  })

  test('a app nao apaga empresa: sem politica de DELETE, zero linhas', async () => {
    const apagadas = await app.bancoSistema
      .delete(empresa)
      .where(eq(empresa.id, empresaB))
      .returning()
    expect(apagadas).toEqual([])
    const [b] = await dona.bancoSistema.select().from(empresa).where(eq(empresa.id, empresaB))
    expect(b).toBeDefined()
  })

  test('update muda atualizado_em pelo trigger', async () => {
    const [antes] = await dona.bancoSistema.select().from(empresa).where(eq(empresa.id, empresaA))
    await new Promise((r) => setTimeout(r, 10))
    const [depois] = await dona.bancoSistema
      .update(empresa)
      .set({ nome: 'Empresa A2' })
      .where(eq(empresa.id, empresaA))
      .returning()
    expect(depois!.atualizadoEm.getTime()).toBeGreaterThan(antes!.atualizadoEm.getTime())
    expect(depois!.criadoEm).toEqual(antes!.criadoEm)
  })
})

// nao precisa de banco: a recusa vem antes de abrir qualquer conexao
test('comoEmpresa recusa o que nao e uuid antes de abrir transacao', async () => {
  await expect(app.comoEmpresa('abc', async () => 1)).rejects.toThrow(
    new TypeError('comoEmpresa precisa do uuid da empresa, recebeu "abc"'),
  )
})

test('db:push com NODE_ENV=production recusa com codigo 1, mesmo sem a url do banco', async () => {
  const rodar = promisify(execFile)
  // sem BANCO_URL_MIGRACAO de proposito: a recusa tem que vir antes de pedir credencial
  const semUrl = Object.fromEntries(
    Object.entries(ambiente).filter(([nome]) => nome !== 'BANCO_URL_MIGRACAO'),
  )
  const tentativa = rodar('node_modules/.bin/tsx', ['src/banco/push.ts'], {
    env: { ...semUrl, NODE_ENV: 'production' },
  })
  await expect(tentativa).rejects.toMatchObject({
    code: 1,
    stderr: expect.stringContaining('db:push nao roda em producao; use db:migrar'),
  })
})
