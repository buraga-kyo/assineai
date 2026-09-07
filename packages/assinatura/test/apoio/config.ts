// Único lugar dos testes que lê process.env: o certificado de teste mora fora do repo e é
// opcional; sem ele, as suítes que precisam de java com certificado são puladas.
import { fileURLToPath } from 'node:url'

const arquivo = process.env.TESTE_CERTIFICADO_ARQUIVO
const senha = process.env.TESTE_CERTIFICADO_SENHA

export const certificadoDeTeste = arquivo && senha ? { arquivo, senha } : undefined
export const temCertificado = certificadoDeTeste !== undefined

/** O JAR mora em Arquivos/Permanente na raiz do repo; TESTE_JSIGNPDF_JAR troca o caminho. */
export const jar =
  process.env.TESTE_JSIGNPDF_JAR ??
  fileURLToPath(new URL('../../../../Arquivos/Permanente/JSignPdf.jar', import.meta.url))

/** As leituras de /proc/<pid>/cmdline só existem no Linux. */
export const ehLinux = process.platform === 'linux'
