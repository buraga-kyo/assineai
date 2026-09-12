import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_ANCORAGEM = 'ancoragem'
export const filaAncoragem = criarFila(FILA_ANCORAGEM)

export function criarWorkerAncoragem(comoEmpresa: ComoEmpresa) {
  return criarWorker(FILA_ANCORAGEM, comoEmpresa, async (job, banco) => {
    log.info({ jobId: job.id, empresaId: job.data.empresaId }, 'Processando ancoragem no tempo')
  })
}
