import type { PedidoDeSelagem } from './tipos.js'

/** Sufixo que o JSignPdf põe na saída (-os): entrada.pdf vira entrada_selado.pdf. */
export const SUFIXO_SAIDA = '_selado'
export const NIVEL_PADRAO = 'CERTIFIED_NO_CHANGES_ALLOWED'

export interface CaminhosDaSelagem {
  jar: string
  pasta: string
  entrada: string
}

/** Linha do JSignPdf: SHA256 sempre (o padrão do JAR é SHA1) e certificação por padrão. */
export function montarArgumentosDeSelagem(
  pedido: PedidoDeSelagem,
  caminhos: CaminhosDaSelagem,
): string[] {
  const { certificado, tsa, visivel } = pedido
  const args = ['-jar', caminhos.jar, '-kst', 'PKCS12', '-ksf', certificado.arquivo]
  args.push('-ksp', certificado.senha)
  if (certificado.alias) args.push('-ka', certificado.alias)
  args.push('-ha', 'SHA256', '-cl', pedido.nivel ?? NIVEL_PADRAO)
  if (pedido.razao) args.push('-r', pedido.razao)
  if (pedido.local) args.push('-l', pedido.local)
  if (pedido.contato) args.push('-c', pedido.contato)
  args.push('-d', caminhos.pasta, '-os', SUFIXO_SAIDA, '-q')
  if (pedido.anexar) args.push('-a')
  if (tsa) {
    args.push('-ts', tsa.url, '-tsh', 'SHA256')
    if (tsa.usuario) args.push('-ta', 'PASSWORD', '-tsu', tsa.usuario, '-tsp', tsa.senha ?? '')
  }
  if (visivel) {
    const { pagina, llx, lly, urx, ury } = visivel
    args.push('-V', '-pg', `${pagina}`, '-llx', `${llx}`, '-lly', `${lly}`)
    args.push('-urx', `${urx}`, '-ury', `${ury}`)
    if (visivel.imagem) args.push('--img-path', visivel.imagem)
    if (visivel.imagem) args.push('--render-mode', 'GRAPHIC_AND_DESCRIPTION')
  }
  args.push(caminhos.entrada)
  return args
}

/** Senhas que não podem aparecer em log: a do keystore e a do TSA. */
export function segredosDoPedido(pedido: PedidoDeSelagem): string[] {
  return [pedido.certificado.senha, pedido.tsa?.senha].filter((s): s is string => Boolean(s))
}
