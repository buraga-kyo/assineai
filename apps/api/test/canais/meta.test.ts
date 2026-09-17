import { test, expect } from 'vitest'
import { CanalWhatsAppMeta } from '../../src/canais/meta.js'

test('interpretarWebhook extrai texto do payload da Meta', () => {
  const meta = new CanalWhatsAppMeta()
  
  const payloadMeta = {
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "123456789",
        "changes": [
          {
            "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                "display_phone_number": "15550000000",
                "phone_number_id": "1234567890"
              },
              "contacts": [
                {
                  "profile": {
                    "name": "João Signatario"
                  },
                  "wa_id": "5511999999999"
                }
              ],
              "messages": [
                {
                  "from": "5511999999999",
                  "id": "wamid.HBgL...",
                  "timestamp": "1663102431",
                  "text": {
                    "body": "ACEITO 999888"
                  },
                  "type": "text"
                }
              ]
            },
            "field": "messages"
          }
        ]
      }
    ]
  }

  const eventos = meta.interpretarWebhook(payloadMeta)
  
  expect(eventos).toHaveLength(1)
  expect(eventos[0]!.canal).toBe('whatsapp_meta')
  expect(eventos[0]!.identidadeExterna).toBe('5511999999999')
  expect(eventos[0]!.conteudoTexto).toBe('ACEITO 999888')
})
