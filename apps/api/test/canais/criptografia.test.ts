import { test, expect, vi, beforeAll, afterAll } from 'vitest'
import { FabricaDeCanais } from '../../src/canais/fabrica.js'
import * as configMod from '../../src/config.js'

// Faz o mock da config pra ter a CHAVE_MESTRA (32 bytes em base64 = 44 caracteres)
// openssl rand -base64 32
const CHAVE_MESTRA_MOCK = 'x4Hk/8X1F/q7V1/pU2B0iZ1q1U8A5uYV5k2+L9R2MHg='

beforeAll(() => {
  vi.spyOn(configMod, 'carregarConfigOuSair').mockReturnValue({
    CHAVE_MESTRA: CHAVE_MESTRA_MOCK,
    CHAVE_ID: '1',
    // (mock das outras propriedades se precisar, mas a cifragem só usa essas)
  } as any)
})

afterAll(() => {
  vi.restoreAllMocks()
})

test('cifra e decifra um objeto de credenciais com sucesso', () => {
  const credenciaisAbertas = { token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11', webhookId: 'abc-123' }
  
  const cifrado = FabricaDeCanais.cifrarCredenciais(credenciaisAbertas)
  
  // O formato deve ser um JSON com a tag, iv, etc.
  const payload = JSON.parse(cifrado)
  expect(payload).toHaveProperty('versaoChave', '1')
  expect(payload).toHaveProperty('iv')
  expect(payload).toHaveProperty('tag')
  expect(payload).toHaveProperty('conteudo')
  
  // A string original não pode estar visível
  expect(cifrado).not.toContain('123456:ABC-DEF')

  // Decifrar deve retornar o objeto igual
  const decifrado = FabricaDeCanais.decifrarCredenciais(cifrado)
  expect(decifrado).toEqual(credenciaisAbertas)
})

test('falha ao decifrar se o payload foi adulterado', () => {
  const credenciaisAbertas = { segredo: 'super-secreto' }
  const cifrado = FabricaDeCanais.cifrarCredenciais(credenciaisAbertas)
  
  const payload = JSON.parse(cifrado)
  // Adultera o conteúdo cifrado
  payload.conteudo = 'a' + payload.conteudo.slice(1)
  
  expect(() => FabricaDeCanais.decifrarCredenciais(JSON.stringify(payload))).toThrow()
})
