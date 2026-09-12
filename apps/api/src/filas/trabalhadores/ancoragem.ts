import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'
import { driverOts } from '../../servicos/opentimestamps.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)

export const FILA_ANCORAGEM = 'ancoragem'
export const filaAncoragem = criarFila(FILA_ANCORAGEM)

export function criarWorkerAncoragem(comoEmpresa: ComoEmpresa) {
  return criarWorker(FILA_ANCORAGEM, comoEmpresa, async (job, banco) => {
    log.info({ jobId: job.id, empresaId: job.data.empresaId }, 'Processando ancoragem no tempo')
    
    // Na vida real a gente puxaria o hash_final do envelope do banco,
    // carimbaria com o driverOts e gravaria o buffer gerado de volta no carimbo_tempo
    const hashFicticio = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
    try {
      const bufferOts = await driverOts.carimbar(hashFicticio)
      log.info({ bytes: bufferOts.length }, 'Carimbo de tempo OpenTimestamps gerado')
      // gravarNoBanco(bufferOts)
    } catch (e: any) {
      log.error({ erro: e.message }, 'Falha na ancoragem')
      throw e
    }
  })
}
