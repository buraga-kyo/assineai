import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'
import { FabricaDeCanais } from '../../canais/fabrica.js'
import { envelopes, signatariosEnvelope } from '../../banco/esquema/envelope.js'
import { canal, type TipoCanal } from '../../banco/esquema/canais.js'
import { and, eq } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_CONVITES = 'convites'
export const filaConvites = criarFila(FILA_CONVITES)

export function criarWorkerConvites(comoEmpresa: ComoEmpresa) {
  return criarWorker(FILA_CONVITES, comoEmpresa, async (job, tx) => {
    const data = job.data as any
    const { empresaId, envelopeId, signatarioId } = data
    log.info({ jobId: job.id, empresaId, signatarioId }, 'Processando envio de convite')

    const [env] = await tx.select().from(envelopes).where(eq(envelopes.id, envelopeId))
    const [sig] = await tx.select().from(signatariosEnvelope).where(eq(signatariosEnvelope.id, signatarioId))
    
    if (!env || !sig) throw new Error('Envelope ou signatário não encontrado')

    // No MVP, vamos usar e-mail como fallback e o contato canal direto da tabela se existir
    // Assumindo que o "canal" selecionado foi guardado no signatario ou inferido
    // O mock da UI mandou 'email', 'whatsapp', etc...
    // Pra simplificar, vamos assumir que sig.email guarda o telefone/handle ou email msm
    
    // Gera OTP e Token
    const tokenPub = randomBytes(16).toString('hex')
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    // Na vida real a gente salvaria esse OTP/Token na tabela signatariosEnvelope ou link_assinatura pra validar depois
    
    const link = `${config.CORS_ORIGENS.split(',')[0] || 'http://localhost:5173'}/assinar/${tokenPub}`
    const mensagem = `AssineAi: Você recebeu o documento "${env.titulo}" para assinar.\nLink: ${link}\nCódigo de acesso: ${otp}`

    log.info({ emailOutel: sig.email }, 'Disparando convite para signatário')

    // Vamos buscar o canal 'whatsapp_evolution' ou 'whatsapp_meta' da empresa se o formato do email parecer um telefone
    // (simplificação monstra de MVP)
    const ehTelefone = /^[0-9]+$/.test(sig.email.replace(/\D/g, ''))
    
    if (ehTelefone) {
      const canaisAtivos = await tx.select().from(canal).where(eq(canal.empresaId, empresaId))
      const canalZap = canaisAtivos.find(c => c.tipo.includes('whatsapp') && c.credenciaisCifradas)
      
      if (canalZap && canalZap.credenciaisCifradas) {
        try {
          const credenciais = FabricaDeCanais.decifrarCredenciais(canalZap.credenciaisCifradas)
          const driver = FabricaDeCanais.obter(canalZap.tipo as TipoCanal)
          const sucesso = await driver.enviarMensagemDeTexto(sig.email, mensagem, credenciais)
          
          if (sucesso) {
            log.info('Convite enviado com sucesso via canal')
            return
          }
        } catch (e: any) {
          log.error({ erro: e.message }, 'Falha ao enviar pelo canal')
        }
      }
    }

    // Se for email real, usariamos o SMTP da empresa ou Mailpit no MVP (não construimos a classe CanalEmail mas a ideia é essa)
    log.info('Convite disparado simulando email/fallback')
  })
}
