import { test, expect } from 'vitest'
import { CanalEvolution } from '../../src/canais/evolution.js'

test('interpretarWebhook converte o webhook da evolution no formato EventoRecebido', () => {
  const evolution = new CanalEvolution()
  
  const payloadEvolution = {
    event: 'messages.upsert',
    data: {
      key: {
        remoteJid: '5511999999999@s.whatsapp.net',
        fromMe: false
      },
      message: {
        conversation: 'ACEITO 777888'
      }
    }
  }

  const eventos = evolution.interpretarWebhook(payloadEvolution)
  
  expect(eventos).toHaveLength(1)
  expect(eventos[0].canal).toBe('whatsapp_evolution')
  expect(eventos[0].identidadeExterna).toBe('5511999999999')
  expect(eventos[0].conteudoTexto).toBe('ACEITO 777888')
})
