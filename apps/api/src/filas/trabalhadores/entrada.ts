import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_ENTRADA = 'entrada'
export const filaEntrada = criarFila(FILA_ENTRADA)

export function criarWorkerEntrada(comoEmpresa: ComoEmpresa) {
  return criarWorker(FILA_ENTRADA, comoEmpresa, async (job, banco) => {
    log.info({ jobId: job.id, empresaId: job.data.empresaId }, 'Processando item da fila de entrada')
  })
}
