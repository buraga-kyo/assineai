import { describe, expect, test, beforeAll, afterAll } from 'vitest'
import { criarAppDeTeste } from './apoio.js'
import { sql } from 'drizzle-orm'
import { empresa, usuario, sessao } from '../src/banco/esquema/index.js'
import { criarBanco } from '../src/banco/conexao.js'
import { BANCO_URL_MIGRACAO, temBanco } from './config.js'
import type { App } from '../src/app.js'

const rodada = `test-us-${Date.now()}`
const dona = criarBanco(BANCO_URL_MIGRACAO ?? '')

describe.skipIf(!temBanco)('usuarios e sessao', () => {
  let app: App

  beforeAll(() => {
    const teste = criarAppDeTeste()
    app = teste.app
  })

  afterAll(async () => {
    // Limpa os dados criados nos testes
    await dona.bancoSistema.delete(sessao).execute()
    await dona.bancoSistema.delete(usuario).where(sql`${usuario.email} like ${`test-%@${rodada}.com`}`)
    await dona.bancoSistema.delete(empresa).where(sql`${empresa.slug} like ${`test-emp-%`}`)
    await Promise.all([dona.fechar(), app.close()])
  })

  test('POST /usuarios cria empresa e usuario dono de verdade', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/usuarios',
      headers: { 'X-Requisicao': '1' },
      payload: {
        nomeEmpresa: `Test Emp ${rodada}`,
        nome: 'Dono Teste',
        email: `test-dono@${rodada}.com`,
        senha: 'senha-super-segura-123',
      },
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.body)
    expect(body.ok).toBe(true)
    expect(body.empresaId).toBeDefined()
    expect(body.usuarioId).toBeDefined()
  })

  test('POST /sessao (login) - falha com e-mail incorreto', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/sessao',
      headers: { 'X-Requisicao': '1' },
      payload: {
        email: `test-inexistente@${rodada}.com`,
        senha: 'senha-qualquer-999',
      },
    })

    expect(res.statusCode).toBe(401)
    const body = JSON.parse(res.body)
    expect(body.erro?.mensagem || body.error).toMatch(/E-mail ou (código|senha) incorretos/)
  })

  test('POST /sessao (login) - sucesso com credenciais corretas', async () => {
    // Primeiro cria um usuario
    const email = `test-login@${rodada}.com`
    const senha = 'senha-login-123'
    
    await app.inject({
      method: 'POST',
      url: '/usuarios',
      headers: { 'X-Requisicao': '1' },
      payload: {
        nomeEmpresa: `Test Emp Login ${rodada}`,
        nome: 'Login Teste',
        email,
        senha,
      },
    })

    // Tenta o login
    const res = await app.inject({
      method: 'POST',
      url: '/sessao',
      headers: { 'X-Requisicao': '1' },
      payload: { email, senha },
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.ok).toBe(true)

    // Verifica se Set-Cookie contem __Host-sessao e atributos de segurança
    const setCookie = res.headers['set-cookie']
    expect(setCookie).toBeDefined()
    expect(setCookie).toContain('__Host-sessao=')
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('Secure')
    expect(setCookie).toContain('SameSite=Lax')
  })

  test('GET /sessao sem cookie retorna 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/sessao',
    })

    expect(res.statusCode).toBe(401)
  })

  test('GET /sessao e DELETE /sessao funcionam de ponta a ponta', async () => {
    const email = `test-fluxo@${rodada}.com`
    const senha = 'senha-fluxo-123'
    
    await app.inject({
      method: 'POST',
      url: '/usuarios',
      headers: { 'X-Requisicao': '1' },
      payload: {
        nomeEmpresa: `Test Emp Fluxo ${rodada}`,
        nome: 'Fluxo Teste',
        email,
        senha,
      },
    })

    // 1. Faz login para pegar o cookie
    const loginRes = await app.inject({
      method: 'POST',
      url: '/sessao',
      headers: { 'X-Requisicao': '1' },
      payload: { email, senha },
    })

    const rawCookieRaw = loginRes.headers['set-cookie']
    const rawCookie = Array.isArray(rawCookieRaw) ? rawCookieRaw[0] : rawCookieRaw
    const token = (rawCookie as string).split(';')[0]!.split('=')[1]

    // 2. GET /sessao com o cookie ativo
    const sessaoRes = await app.inject({
      method: 'GET',
      url: '/sessao',
      headers: {
        cookie: `__Host-sessao=${token}`,
      },
    })

    expect(sessaoRes.statusCode).toBe(200)
    const sessaoBody = JSON.parse(sessaoRes.body)
    expect(sessaoBody.ok).toBe(true)
    expect(sessaoBody.usuario.email).toBe(email)
    expect(sessaoBody.usuario.nome).toBe('Fluxo Teste')

    // 3. DELETE /sessao para deslogar (logout)
    const logoutRes = await app.inject({
      method: 'DELETE',
      url: '/sessao',
      headers: {
        cookie: `__Host-sessao=${token}`,
        'X-Requisicao': '1'
      },
    })

    expect(logoutRes.statusCode).toBe(200)
    const logoutCookie = logoutRes.headers['set-cookie'] as string
    expect(logoutCookie).toContain('Max-Age=0')

    // 4. GET /sessao com o cookie antigo (deve falhar por revogação)
    const sessaoFailingRes = await app.inject({
      method: 'GET',
      url: '/sessao',
      headers: {
        cookie: `__Host-sessao=${token}`,
      },
    })

    expect(sessaoFailingRes.statusCode).toBe(401)
  })
})
