// Tudo que o pacote oferece. Nomes em português; nada aqui lê variável de ambiente.
export { selarPdf } from './jsignpdf/selar.js'
export { criarSelador, CONCORRENCIA_PADRAO, type Selador } from './jsignpdf/selador.js'
export { TIMEOUT_PADRAO_MS } from './jsignpdf/processo.js'
export {
  verificarCertificado,
  listarAliases,
  lerCertificadoPkcs12,
  calcularVencimento,
  type DadosDoCertificado,
  type OpcoesDaVerificacao,
} from './jsignpdf/certificado.js'
export {
  ErroJSignPdf,
  ErroLinhaDeComandoJSignPdf,
  ErroNenhumaOperacaoJSignPdf,
  ErroSelagemJSignPdf,
  ErroTimeoutJSignPdf,
  ErroJavaIndisponivel,
  ErroCertificado,
  redigir,
  erroPorSaida,
  resumirStderr,
} from './jsignpdf/erros.js'
export { escaparArgumento, montarArgfile } from './jsignpdf/argfile.js'
export {
  montarArgumentosDeSelagem,
  segredosDoPedido,
  SUFIXO_SAIDA,
  NIVEL_PADRAO,
} from './jsignpdf/argumentos.js'
export { PREFIXO_PASTA } from './jsignpdf/pasta.js'
export type {
  Ambiente,
  AssinaturaVisivel,
  CarimboDoTempo,
  Certificado,
  NivelDeCertificacao,
  PedidoDeSelagem,
  ResultadoDaSelagem,
} from './jsignpdf/tipos.js'
