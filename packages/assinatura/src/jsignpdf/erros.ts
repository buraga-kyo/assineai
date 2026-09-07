// Erros do wrapper do JSignPdf. Toda mensagem e todo stderr passam por redigir(),
// para a senha do certificado nunca chegar a log nenhum.

export interface DetalhesDoErro {
  codigoDeSaida?: number | null
  stderr?: string
  causa?: unknown
}

export class ErroJSignPdf extends Error {
  readonly codigoDeSaida: number | null
  readonly stderr: string

  constructor(mensagem: string, detalhes: DetalhesDoErro = {}) {
    super(mensagem, detalhes.causa === undefined ? undefined : { cause: detalhes.causa })
    this.name = new.target.name
    this.codigoDeSaida = detalhes.codigoDeSaida ?? null
    this.stderr = detalhes.stderr ?? ''
  }
}

/** Saída 1: o JSignPdf não entendeu a linha de comando. */
export class ErroLinhaDeComandoJSignPdf extends ErroJSignPdf {}
/** Saída 2: nenhuma operação pedida (faltou o PDF, por exemplo). */
export class ErroNenhumaOperacaoJSignPdf extends ErroJSignPdf {}
/** Saída 3 ou 4: a selagem em si falhou (senha errada, PDF inválido, certificado vencido). */
export class ErroSelagemJSignPdf extends ErroJSignPdf {}
/** O java passou do tempo e levou SIGKILL. */
export class ErroTimeoutJSignPdf extends ErroJSignPdf {}
/** O binário do java não pôde ser executado (evento error do spawn). */
export class ErroJavaIndisponivel extends ErroJSignPdf {}
/** O certificado não abriu, não traz certificado ou não tem o alias pedido. */
export class ErroCertificado extends ErroJSignPdf {}

/** Troca cada segredo por [redigido]; segredo vazio ou ausente é ignorado. */
export function redigir(texto: string, segredos: string | readonly (string | undefined)[]): string {
  const lista = typeof segredos === 'string' ? [segredos] : segredos
  let limpo = texto
  for (const segredo of lista) {
    if (segredo) limpo = limpo.split(segredo).join('[redigido]')
  }
  return limpo
}

export interface SaidaDoProcesso {
  codigo: number | null
  sinal: string | null
  stderr: string
}

/** Primeira linha do stderr que não é ruído do JSignPdf ("DETALHADO ...") nem pilha. */
export function resumirStderr(stderr: string): string {
  const linha = stderr
    .split('\n')
    .map((l) => l.trimEnd())
    .find((l) => l !== '' && !l.startsWith('DETALHADO') && !/^\s/.test(l))
  return linha ?? '(sem detalhe no stderr)'
}

/** Traduz o código de saída do JSignPdf (tabela do --help) no erro tipado. */
export function erroPorSaida(saida: SaidaDoProcesso): ErroJSignPdf {
  const detalhes = { codigoDeSaida: saida.codigo, stderr: saida.stderr }
  const resumo = resumirStderr(saida.stderr)
  switch (saida.codigo) {
    case 1:
      return new ErroLinhaDeComandoJSignPdf(
        `o JSignPdf recusou a linha de comando: ${resumo}`,
        detalhes,
      )
    case 2:
      return new ErroNenhumaOperacaoJSignPdf(
        `o JSignPdf não recebeu nenhuma operação: ${resumo}`,
        detalhes,
      )
    case 3:
    case 4:
      return new ErroSelagemJSignPdf(`o JSignPdf não conseguiu selar o PDF: ${resumo}`, detalhes)
    default: {
      const como = `código ${saida.codigo ?? 'nenhum'}, sinal ${saida.sinal ?? 'nenhum'}`
      return new ErroSelagemJSignPdf(
        `o java terminou de um jeito inesperado (${como}): ${resumo}`,
        detalhes,
      )
    }
  }
}
