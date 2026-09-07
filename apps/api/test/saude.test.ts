import { describe, expect, it } from 'vitest'
import { medir } from '../src/saude/dependencias.js'
import { capturarLog, criarAppDeTeste, falha } from './apoio.js'

describe('GET /saude', () => {
  it('responde 200 com o estado de cada dependencia', async () => {
    const { app } = criarAppDeTeste()
    const resposta = await app.inject({ method: 'GET', url: '/saude' })
    expect(resposta.statusCode).toBe(200)
    const corpo = resposta.json()
    expect(corpo.ok).toBe(true)
    for (const nome of ['banco', 'redis', 'storage']) {
      expect(corpo.dependencias[nome].ok).toBe(true)
      expect(typeof corpo.dependencias[nome].ms).toBe('number')
    }
    await app.close()
  })

  it('responde 503 quando uma dependencia falha, dizendo qual', async () => {
    const { app, texto } = criarAppDeTeste({ redis: falha })
    const resposta = await app.inject({ method: 'GET', url: '/saude' })
    expect(resposta.statusCode).toBe(503)
    const corpo = resposta.json()
    expect(corpo.ok).toBe(false)
    expect(corpo.dependencias.redis.ok).toBe(false)
    expect(corpo.dependencias.banco.ok).toBe(true)
    expect(texto()).toContain('dependencia falhou')
    await app.close()
  })

  it('checagem que passa do limite conta como falha', async () => {
    const { logger } = capturarLog()
    const lenta = () => new Promise((resolver) => setTimeout(resolver, 50))
    const estado = await medir('lenta', lenta, logger, 10)
    expect(estado.ok).toBe(false)
    expect(estado.ms).toBeLessThan(50)
  })
})
