import pLimit from 'p-limit'
import { selarPdf } from './selar.js'
import type { Ambiente, PedidoDeSelagem, ResultadoDaSelagem } from './tipos.js'

export const CONCORRENCIA_PADRAO = 2

export interface Selador {
  selar(pedido: PedidoDeSelagem): Promise<ResultadoDaSelagem>
  /** Selagens rodando agora. */
  readonly ativas: number
  /** Selagens esperando vaga. */
  readonly naFila: number
}

/** Um limitador por instância: no máximo `ambiente.concorrencia` (padrão 2) javas ao mesmo tempo. */
export function criarSelador(ambiente: Ambiente): Selador {
  const limitar = pLimit(ambiente.concorrencia ?? CONCORRENCIA_PADRAO)
  return {
    selar: (pedido) => limitar(() => selarPdf(pedido, ambiente)),
    get ativas() {
      return limitar.activeCount
    },
    get naFila() {
      return limitar.pendingCount
    },
  }
}
