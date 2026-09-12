import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_MANUTENCAO = 'manutencao'
export const filaManutencao = criarFila(FILA_MANUTENCAO)

export function criarWorkerManutencao(comoEmpresa: ComoEmpresa) {
  // Configurando cron jobs ao inicializar o worker
  filaManutencao.upsertJobScheduler('expirar-envelopes-scheduler', { pattern: '0 * * * *' }, { data: { empresaId: 'sistema' }, name: 'expirar-envelopes' })
  filaManutencao.upsertJobScheduler('alerta-certificado-scheduler', { pattern: '0 0 * * *' }, { data: { empresaId: 'sistema' }, name: 'alerta-certificado' })
  
  return criarWorker(FILA_MANUTENCAO, comoEmpresa, async (job, banco) => {
    log.info({ jobId: job.id, nome: job.name }, 'Processando rotina de manutencao')
  })
}
