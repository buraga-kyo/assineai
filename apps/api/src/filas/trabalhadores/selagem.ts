import { criarFila, criarWorker, type ComoEmpresa } from '../config.js'
import { criarLogger } from '../../logger.js'
import { carregarConfigOuSair } from '../../config.js'
import { ErroSelagemJSignPdf } from '@assineai/assinatura/src/jsignpdf/erros.js' // Caminho mockado, na vida real seria importado do pacote

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

      // Configuração do TSA repassada pro JSignPdf caso exista
      const tsa = config.TSA_URL ? {
        url: config.TSA_URL,
        usuario: config.TSA_USUARIO,
        senha: config.TSA_SENHA
      } : undefined

      if (tsa) {
        log.info({ url: tsa.url }, 'Selagem utilizará carimbo do tempo ICP-Brasil (TSA)')
      }

      // Mock da chamada que selaria o PDF com o pacote de assinatura
      try {
        // await selador.selar({ ...pedido, tsa })
      } catch (erro: any) {
        if (erro instanceof ErroSelagemJSignPdf && erro.message.includes('TSA')) {
          log.error({ erro: erro.message }, 'Falha de comunicação com a TSA da ICP-Brasil')
          // Atualizaria estado do envelope para erro_selagem
        }
        throw erro
      }
    },
    { concurrency: 1 } // Garantir que selagem seja sequencial (um por vez)
  )
}
