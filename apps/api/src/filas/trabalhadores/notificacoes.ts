import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'
import { FabricaDeCanais } from '../../canais/fabrica.js'
import { usuario } from '../../banco/esquema/usuario.js'
import { canal } from '../../banco/esquema/canais.js'
import { envelopes } from '../../banco/esquema/envelope.js'
import { and, eq } from 'drizzle-orm'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_NOTIFICACOES = 'notificacoes'
export const filaNotificacoes = criarFila(FILA_NOTIFICACOES)

export function criarWorkerNotificacoes(comoEmpresa: ComoEmpresa) {
  return criarWorker(FILA_NOTIFICACOES, comoEmpresa, async (job, banco) => {
    const data = job.data as any
    const { empresaId, envelopeId, motivo, textoOpcional } = data
    log.info({ jobId: job.id, empresaId, envelopeId, motivo }, 'Processando notificacao ao dono')

    await banco.comoEmpresa(empresaId, async (tx: any) => {
      // Pega o dono
      const [dono] = await tx.select().from(usuario).where(and(eq(usuario.empresaId, empresaId), eq(usuario.papel, 'dono')))
      if (!dono) return

      // Verifica preferências
      const prefs = dono.preferenciasNotificacao as any
      if (prefs?.desligado?.includes(motivo)) {
        return // O dono escolheu não receber este evento
      }

      const canalEscolhido = prefs?.canalPrimario // ex: { tipo: 'whatsapp_evolution', contato: '5511999999999' }
      if (!canalEscolhido) return // Não configurou pra onde mandar

      // Pega os dados do envelope
      const [envelope] = await tx.select().from(envelopes).where(eq(envelopes.id, envelopeId))
      if (!envelope) return

      const urlFront = config.URL_APP || 'http://localhost:5173'
      const link = `${urlFront}/envelopes/${envelope.id}`
      
      const mensagensPorMotivo: Record<string, string> = {
        'assinado': `✅ O signatário assinou o envelope *${envelope.titulo}*.\n${link}`,
        'recusado': `❌ Um signatário recusou o envelope *${envelope.titulo}*.\n${link}`,
        'erro_entrega': `⚠️ Falha ao entregar o envelope *${envelope.titulo}* para um signatário.\n${link}`
      }

      const textoFinal = textoOpcional || mensagensPorMotivo[motivo] || `Aviso sobre o envelope *${envelope.titulo}*.\n${link}`

      // Acha o canal no banco pra pegar a credencial
      const [canalDb] = await tx.select().from(canal).where(and(eq(canal.empresaId, empresaId), eq(canal.tipo, canalEscolhido.tipo)))
      if (!canalDb || !canalDb.credenciaisCifradas) return

      try {
        const credenciais = FabricaDeCanais.decifrarCredenciais(canalDb.credenciaisCifradas)
        const driver = FabricaDeCanais.obter(canalDb.tipo as any)
        
        await driver.enviarMensagemDeTexto(canalEscolhido.contato, textoFinal, credenciais)
        log.info({ tipo: canalDb.tipo, contato: canalEscolhido.contato }, 'Notificação enviada ao dono')
      } catch (e: any) {
        log.error({ erro: e.message }, 'Falha ao notificar dono')
        throw e
      }
    })
  })
}
