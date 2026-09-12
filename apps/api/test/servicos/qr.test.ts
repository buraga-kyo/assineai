import { test, expect } from 'vitest'
import { gerarQrEmMemoria } from '../../src/servicos/qr.js'

test('gera buffer png do qr code em memoria', async () => {
  const buffer = await gerarQrEmMemoria('123456789abc')
  
  expect(buffer).toBeInstanceOf(Buffer)
  expect(buffer.length).toBeGreaterThan(0)
  
  // Confere a assinatura mágica do PNG
  expect(buffer[0]).toBe(0x89)
  expect(buffer[1]).toBe(0x50) // P
  expect(buffer[2]).toBe(0x4E) // N
  expect(buffer[3]).toBe(0x47) // G
})
