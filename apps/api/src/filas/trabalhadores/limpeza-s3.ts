import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_LIMPEZA_S3 = 'limpeza-s3'
export const filaLimpezaS3 = criarFila(FILA_LIMPEZA_S3)

export function criarWorkerLimpezaS3(comoEmpresa: ComoEmpresa) {
  // Configurando cron job ao inicializar o worker
  filaLimpezaS3.upsertJobScheduler('limpeza-s3-scheduler', { pattern: '0 * * * *' }, { data: { empresaId: 'sistema' }, name: 'limpeza-temporarios' })
  
  return criarWorker(FILA_LIMPEZA_S3, comoEmpresa, async (job, banco) => {
    log.info({ jobId: job.id, nome: job.name }, 'Processando rotina de limpeza de arquivos temporarios no S3')
  })
}
