import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ErroDaApi } from '../src/http/erros.js'
import { criarAppDeTeste } from './apoio.js'

function appComRotasDeErro() {
  const teste = criarAppDeTeste()
  teste.app.register(async (app) => {
    const publico = { config: { acesso: 'publico' as const } }
    const corpo = z.object({ nome: z.string().min(1) })
    app.post('/eco', { ...publico, schema: { body: corpo } }, async (request) => request.body)
    app.get('/previsto', publico, async () => {
      throw new ErroDaApi(401, 'nao_autenticado', 'sessao expirada')
    })
    app.get('/explode', publico, async () => {
      throw new Error('tabela X nao existe')
    })
  })
  return teste
}

describe('erro padrao', () => {
  it('rota inexistente devolve 404 no formato padrao e o log nao mostra o cookie', async () => {
    const { app, texto } = appComRotasDeErro()
    const resposta = await app.inject({
      method: 'GET',
      url: '/nao-existe',
      headers: { cookie: 'sessao=SEGREDO123' },
    })
    expect(resposta.statusCode).toBe(404)
    expect(resposta.json()).toEqual({
      erro: { codigo: 'nao_encontrado', mensagem: 'rota nao encontrada' },
    })
    expect(texto()).not.toContain('SEGREDO123')
    await app.close()
  })

  it('erro inesperado devolve 500 sem a mensagem interna, mas o log fica com ela', async () => {
    const { app, texto } = appComRotasDeErro()
    const resposta = await app.inject({ method: 'GET', url: '/explode' })
    expect(resposta.statusCode).toBe(500)
    expect(resposta.json()).toEqual({ erro: { codigo: 'erro_interno', mensagem: 'erro interno' } })
    expect(resposta.body).not.toContain('tabela X')
    expect(texto()).toContain('tabela X nao existe')
    await app.close()
  })
})
