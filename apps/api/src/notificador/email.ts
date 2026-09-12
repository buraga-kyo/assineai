import { createTransport, type Transporter } from 'nodemailer'
import { carregarConfigOuSair } from '../config.js'
import { criarLogger } from '../logger.js'
import type { TemplateOutput } from './templates.js'

let transporter: Transporter | null = null

export function obterTransporter(): Transporter {
  if (!transporter) {
    const config = carregarConfigOuSair()
    if (!config.SMTP_URL) {
      throw new Error('SMTP_URL nao configurado no ambiente')
    }
    transporter = createTransport({ url: config.SMTP_URL })
  }
  return transporter
}

export async function enviarEmail(destinatario: string, template: TemplateOutput): Promise<void> {
  const config = carregarConfigOuSair()
  const log = criarLogger(config)

  if (!config.SMTP_URL) {
    log.warn({ destinatario, assunto: template.assunto }, 'Envio de e-mail pulado: SMTP_URL ausente')
    return
  }

  const transportador = obterTransporter()
  const remetente = config.EMAIL_REMETENTE || 'nao-responda@assineai.com.br'

  try {
    const info = await transportador.sendMail({
      from: remetente,
      to: destinatario,
      subject: template.assunto,
      text: template.texto,
      html: template.html,
    })
    log.info({ destinatario, mensagemId: info.messageId }, 'E-mail enviado com sucesso')
  } catch (erro) {
    log.error({ destinatario, erro }, 'Falha ao enviar e-mail')
    throw erro
  }
}
