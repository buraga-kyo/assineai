// Tipos públicos do wrapper. Nada aqui lê variável de ambiente: quem chama passa tudo.

export type NivelDeCertificacao = 'CERTIFIED_NO_CHANGES_ALLOWED' | 'NOT_CERTIFIED'

export interface Certificado {
  /** Caminho do PKCS12 (.pfx ou .p12). */
  arquivo: string
  senha: string
  /** Alias da chave dentro do keystore; sem ele o JSignPdf usa a primeira. */
  alias?: string
}

export interface CarimboDoTempo {
  url: string
  usuario?: string
  senha?: string
}

export interface AssinaturaVisivel {
  pagina: number
  llx: number
  lly: number
  urx: number
  ury: number
  /** Imagem do carimbo; com ela o modo passa a GRAPHIC_AND_DESCRIPTION. */
  imagem?: string
}

export interface PedidoDeSelagem {
  entrada: Buffer
  certificado: Certificado
  razao: string
  local: string
  contato: string
  /** Padrão: CERTIFIED_NO_CHANGES_ALLOWED. */
  nivel?: NivelDeCertificacao
  /**
   * true acrescenta a assinatura às que já existem em vez de substituir. Use com nivel
   * NOT_CERTIFIED: um PDF já certificado com CERTIFIED_NO_CHANGES_ALLOWED não aceita outra
   * assinatura, e o JSignPdf recusa a combinação.
   */
  anexar?: boolean
  tsa?: CarimboDoTempo
  visivel?: AssinaturaVisivel
  /** Padrão: 60 000 ms; estourou, o java leva SIGKILL. */
  timeoutMs?: number
}

export interface Ambiente {
  /** Caminho do JSignPdf.jar. */
  jar: string
  /** Padrão: "java" no PATH. */
  javaBin?: string
  /** Quantas selagens ao mesmo tempo no criarSelador; vem de ASSINATURA_CONCORRENCIA. Padrão: 2. */
  concorrencia?: number
  /** Chamado com o pid do java assim que ele sobe (o teste lê /proc/<pid>/cmdline por aqui). */
  aoIniciar?: (pid: number) => void
}

export interface ResultadoDaSelagem {
  saida: Buffer
  duracaoMs: number
  stdout: string
}
