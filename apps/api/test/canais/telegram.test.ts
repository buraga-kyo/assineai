import { test, expect } from 'vitest'
import { CanalTelegram } from '../../src/canais/telegram.js'

test('interpretarWebhook converte o formato do Telegram para nosso EventoRecebido', () => {
  const telegram = new CanalTelegram()
  
  const payloadTelegram = {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Signatario'
      },
      text: 'ACEITO 123456'
    }
  }

  const eventos = telegram.interpretarWebhook(payloadTelegram)
  
  expect(eventos).toHaveLength(1)
  expect(eventos[0]!.canal).toBe('telegram')
  expect(eventos[0]!.identidadeExterna).toBe('987654321')
  expect(eventos[0]!.conteudoTexto).toBe('ACEITO 123456')
})
