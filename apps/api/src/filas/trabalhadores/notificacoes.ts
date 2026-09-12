import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_NOTIFICACOES = 'notificacoes'
export const filaNotificacoes = criarFila(FILA_NOTIFICACOES)

export function criarWorkerNotificacoes(comoEmpresa: ComoEmpresa) {
  return criarWorker(FILA_NOTIFICACOES, comoEmpresa, async (job, banco) => {
    log.info({ jobId: job.id, empresaId: job.data.empresaId }, 'Processando notificacao ao dono')
  })
}
