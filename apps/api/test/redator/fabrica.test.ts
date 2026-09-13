import { test, expect, vi, beforeAll, afterAll } from 'vitest'
import { FabricaDeRedator } from '../../src/redator/fabrica.js'
import * as configMod from '../../src/config.js'

beforeAll(() => {
  vi.spyOn(configMod, 'carregarConfigOuSair').mockReturnValue({
    REDATOR_DRIVER: 'nulo'
  } as any)
})

afterAll(() => {
  vi.restoreAllMocks()
})

test('fábrica recusa criar redator se a empresa não optou', () => {
  const configEmpresaDesligada = { copiloto_ativo: false }
  
  expect(() => FabricaDeRedator.obterParaEmpresa(configEmpresaDesligada))
    .toThrow('A empresa não ativou o uso de copiloto/redator')
})

test('fábrica devolve o driver nulo quando configurado', async () => {
  const configEmpresaLigada = { copiloto_ativo: true }
  
  const redator = FabricaDeRedator.obterParaEmpresa(configEmpresaLigada)
  
  const resposta = await redator.completar([])
  expect(resposta).toBe('Sou o RedatorNulo. Resposta simulada para testes.')
})
