import { describe, expect, it } from 'vitest'
import { criarAppDeTeste } from './apoio.js'

describe('acesso por rota', () => {
  it('rota sem config.acesso derruba o registro', () => {
    const { app } = criarAppDeTeste()
    expect(() => app.get('/sem-acesso', async () => 'x')).toThrow(
      /GET \/sem-acesso nao declara acesso/,
    )
  })

  it('valor fora da lista tambem derruba', () => {
    const { app } = criarAppDeTeste()
    const config = { acesso: 'admin' as never }
    expect(() => app.get('/errado', { config }, async () => 'x')).toThrow(/nao declara acesso/)
  })

  it('dentro de um plugin, o boot inteiro falha', async () => {
    const { app } = criarAppDeTeste()
    app.register(async (escopo) => {
      escopo.get('/esquecida', async () => 'x')
    })
    await expect(app.ready()).rejects.toThrow(/nao declara acesso/)
  })

  it('rota declarada sobe e responde', async () => {
    const { app } = criarAppDeTeste()
    app.get('/ok', { config: { acesso: 'sessao' } }, async () => ({ ok: true }))
    const resposta = await app.inject({ method: 'GET', url: '/ok' })
    expect(resposta.statusCode).toBe(200)
    await app.close()
  })
})
