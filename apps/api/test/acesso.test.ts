import { afterEach, describe, expect, it } from 'vitest'
import type { App } from '../src/app.js'
import { criarAppDeTeste } from './apoio.js'

describe('acesso por rota', () => {
  let app: App | undefined

  afterEach(async () => {
    await app?.close().catch(() => undefined)
    app = undefined
  })

  it('rota sem config.acesso derruba o registro', () => {
    ;({ app } = criarAppDeTeste())
    const semAcesso = app
    expect(() => semAcesso.get('/sem-acesso', async () => 'x')).toThrow(
      /GET \/sem-acesso nao declara acesso/,
    )
  })

  it('valor fora da lista tambem derruba', () => {
    ;({ app } = criarAppDeTeste())
    const errado = app
    const config = { acesso: 'admin' as never }
    expect(() => errado.get('/errado', { config }, async () => 'x')).toThrow(/nao declara acesso/)
  })

  it('dentro de um plugin, o boot inteiro falha', async () => {
    ;({ app } = criarAppDeTeste())
    app.register(async (escopo) => {
      escopo.get('/esquecida', async () => 'x')
    })
    await expect(app.ready()).rejects.toThrow(/nao declara acesso/)
  })

  it('rota declarada sobe e responde', async () => {
    ;({ app } = criarAppDeTeste())
    app.get('/ok', { config: { acesso: 'publico' } }, async () => ({ ok: true }))
    const resposta = await app.inject({ method: 'GET', url: '/ok' })
    expect(resposta.statusCode).toBe(200)
  })
})
