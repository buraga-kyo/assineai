// Único lugar dos testes que lê process.env: o certificado de teste mora fora do repo e é
// opcional; sem ele, as suítes que precisam de java com certificado são puladas.
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const fallbackArquivo = fileURLToPath(new URL('../../../../Arquivos/Permanente/cert-teste.pfx', import.meta.url))
const arquivo = process.env.TESTE_CERTIFICADO_ARQUIVO ?? (fs.existsSync(fallbackArquivo) ? fallbackArquivo : undefined)
const senha = process.env.TESTE_CERTIFICADO_SENHA ?? (fs.existsSync(fallbackArquivo) ? 'teste' : undefined)

export const certificadoDeTeste = arquivo && senha ? { arquivo, senha } : undefined
export const temCertificado = certificadoDeTeste !== undefined

/** O JAR mora em Arquivos/Permanente na raiz do repo; TESTE_JSIGNPDF_JAR troca o caminho. */
export const jar =
  process.env.TESTE_JSIGNPDF_JAR ??
  fileURLToPath(new URL('../../../../Arquivos/Permanente/JSignPdf.jar', import.meta.url))

/** As leituras de /proc/<pid>/cmdline só existem no Linux. */
export const ehLinux = process.platform === 'linux'
