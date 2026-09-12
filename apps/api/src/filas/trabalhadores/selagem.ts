import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_SELAGEM = 'selagem'
export const filaSelagem = criarFila(FILA_SELAGEM)

export function criarWorkerSelagem(comoEmpresa: ComoEmpresa) {
  return criarWorker(
    FILA_SELAGEM,
    comoEmpresa,
    async (job, banco) => {
      log.info({ jobId: job.id, empresaId: job.data.empresaId }, 'Processando selagem de PDF')
    },
    { concurrency: 1 } // Garantir que selagem seja sequencial (um por vez)
  )
}
