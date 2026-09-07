import { readFile } from 'node:fs/promises'
import forge from 'node-forge'
import { ErroCertificado } from './erros.js'

export interface DadosDoCertificado {
  titular: string
  emissor: string
  numeroSerie: string
  validoDe: Date
  validoAte: Date
  /** Dias inteiros até vencer; negativo se já venceu. */
  diasParaVencer: number
  alerta30Dias: boolean
  /** Aliases que o JSignPdf enxerga no keystore (-lk). */
  aliases: string[]
}

const DIA_MS = 86_400_000
// OIDs das bolsas do PKCS12: a chave privada cifrada e o certificado.
const BOLSA_CHAVE = '1.2.840.113549.1.12.10.1.2'
const BOLSA_CERTIFICADO = '1.2.840.113549.1.12.10.1.3'

export function calcularVencimento(validoAte: Date, agora: Date) {
  const diasParaVencer = Math.floor((validoAte.getTime() - agora.getTime()) / DIA_MS)
  return { diasParaVencer, alerta30Dias: diasParaVencer <= 30 }
}

/** Abre o PKCS12 e devolve o certificado que casa com a chave (ou o primeiro, se não achar o par). */
export async function lerCertificadoPkcs12(
  arquivo: string,
  senha: string,
): Promise<forge.pki.Certificate> {
  let p12: forge.pkcs12.Pkcs12Pfx
  try {
    const bytes = await readFile(arquivo)
    p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(bytes.toString('binary')), false, senha)
  } catch (causa) {
    const motivo = causa instanceof Error ? causa.message : String(causa)
    throw new ErroCertificado(`não deu para abrir o certificado "${arquivo}": ${motivo}`, { causa })
  }
  const chave = p12.getBags({ bagType: BOLSA_CHAVE })[BOLSA_CHAVE]?.[0]
  const idDaChave: unknown = chave?.attributes?.localKeyId?.[0]
  const certificados = p12.getBags({ bagType: BOLSA_CERTIFICADO })[BOLSA_CERTIFICADO] ?? []
  const doPar = certificados.find((bolsa) => bolsa.attributes?.localKeyId?.[0] === idDaChave)
  const escolhido = (doPar ?? certificados[0])?.cert
  if (!escolhido) throw new ErroCertificado(`o arquivo "${arquivo}" não traz nenhum certificado`)
  return escolhido
}
