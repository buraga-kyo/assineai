import { describe, it, expect, vi, beforeEach } from 'vitest'
import { enviarEmail } from '../../src/notificador/email.js'
import { codigo } from '../../src/notificador/templates.js'

const sendMailMock = vi.fn()

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: sendMailMock,
  })),
}))

vi.mock('../../src/config.js', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../src/config.js')>()
  return {
    ...mod,
    carregarConfigOuSair: vi.fn(() => ({
      SMTP_URL: 'smtp://localhost:1025',
      EMAIL_REMETENTE: 'teste@assineai.com.br',
      LOG_NIVEL: 'silent',
      NODE_ENV: 'test',
    })),
  }
})

describe('Notificador de e-mail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendMailMock.mockResolvedValue({ messageId: '1234' })
  })

  it('deve formatar o template corretamente', () => {
    const template = codigo('Contrato de Prestação de Serviços', '123456')
    expect(template.assunto).toContain('Código de verificação')
    expect(template.texto).toContain('123456')
    expect(template.html).toContain('123456')
  })

  it('deve chamar o nodemailer com remetente, destinatario e conteudo do template', async () => {
    const template = codigo('Contrato', '654321')
    await enviarEmail('cliente@exemplo.com', template)

    expect(sendMailMock).toHaveBeenCalledTimes(1)
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'teste@assineai.com.br',
      to: 'cliente@exemplo.com',
      subject: template.assunto,
      text: template.texto,
      html: template.html,
    })
  })
})
