import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SUFIXO_SAIDA, montarArgumentosDeSelagem, segredosDoPedido } from './argumentos.js'
import { ErroSelagemJSignPdf, erroPorSaida } from './erros.js'
import { comPastaTemporaria, gravarArgfile, gravarPrivado } from './pasta.js'
import { TIMEOUT_PADRAO_MS, rodarJava } from './processo.js'
import type { Ambiente, PedidoDeSelagem, ResultadoDaSelagem } from './tipos.js'

/**
 * Sela um PDF com o JSignPdf. A senha vai num argfile 0600 dentro de uma pasta 0700 que é
 * apagada no fim; o java tem timeout com SIGKILL; e todo erro chega tipado em quem chamou.
 */
export async function selarPdf(
  pedido: PedidoDeSelagem,
  ambiente: Ambiente,
): Promise<ResultadoDaSelagem> {
  return comPastaTemporaria(async (pasta) => {
    const entrada = await gravarPrivado(pasta, 'entrada.pdf', pedido.entrada)
    const argumentos = montarArgumentosDeSelagem(pedido, { jar: ambiente.jar, pasta, entrada })
    const argfile = await gravarArgfile(pasta, argumentos)
    const saida = await rodarJava({
      javaBin: ambiente.javaBin ?? 'java',
      argfile,
      timeoutMs: pedido.timeoutMs ?? TIMEOUT_PADRAO_MS,
      segredos: segredosDoPedido(pedido),
      aoIniciar: ambiente.aoIniciar,
    })
    if (saida.codigo !== 0) throw erroPorSaida(saida)
    const selado = await lerSelado(join(pasta, `entrada${SUFIXO_SAIDA}.pdf`), saida.stderr)
    return { saida: selado, duracaoMs: saida.duracaoMs, stdout: saida.stdout }
  })
}

async function lerSelado(caminho: string, stderr: string): Promise<Buffer> {
  try {
    return await readFile(caminho)
  } catch (causa) {
    const mensagem = 'o JSignPdf terminou com 0 mas não deixou o PDF selado na pasta'
    throw new ErroSelagemJSignPdf(mensagem, { codigoDeSaida: 0, stderr, causa })
  }
}
