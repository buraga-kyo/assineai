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
