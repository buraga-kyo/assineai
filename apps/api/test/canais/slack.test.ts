import { test, expect } from 'vitest'
import { CanalSlack } from '../../src/canais/slack.js'

test('interpretarWebhook ignora url_verification e extrai mensagem do user no Slack', () => {
  const slack = new CanalSlack()
  
  const payloadSlack = {
    "token": "token-falso",
    "team_id": "T12345",
    "api_app_id": "A12345",
    "event": {
      "type": "message",
      "user": "U1234567",
      "text": "ACEITO 555666",
      "ts": "1355517523.000005",
      "channel": "C1234567"
    },
    "type": "event_callback"
  }

  const eventos = slack.interpretarWebhook(payloadSlack)
  
  expect(eventos).toHaveLength(1)
  expect(eventos[0]!.canal).toBe('slack')
  expect(eventos[0]!.identidadeExterna).toBe('U1234567')
  expect(eventos[0]!.conteudoTexto).toBe('ACEITO 555666')
})
