import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_CONVITES = 'convites'
export const filaConvites = criarFila(FILA_CONVITES)

export function criarWorkerConvites(comoEmpresa: ComoEmpresa) {
  return criarWorker(FILA_CONVITES, comoEmpresa, async (job, banco) => {
    log.info({ jobId: job.id, empresaId: job.data.empresaId }, 'Processando envio de convite')
  })
}
