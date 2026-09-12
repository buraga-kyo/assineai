import { randomInt, createHmac, timingSafeEqual } from 'node:crypto'

export interface DadosOtp {
  hash: string
  expiraEm: Date
  tentativas: number
  bloqueado: boolean
}

export type ResultadoValidacaoOtp = 
  | { sucesso: true }
  | { sucesso: false; motivo: 'expirado' | 'bloqueado' | 'invalido'; tentativasRestantes?: number }

export function gerarCodigoEmClaro(): string {
  // randomInt(0, 1000000) produces 0 to 999999
  // .toString().padStart(6, '0') pads with leading zeros
  return randomInt(0, 1000000).toString().padStart(6, '0')
}

export function gerarHmacOtp(codigoEmClaro: string, chaveOtp: string): string {
  return createHmac('sha256', chaveOtp).update(codigoEmClaro).digest('hex')
}

export function validarOtp(
  codigoInformado: string,
  chaveOtp: string,
  dados: DadosOtp,
  maxTentativas: number,
  agora: Date = new Date()
): ResultadoValidacaoOtp {
  if (dados.bloqueado) {
    return { sucesso: false, motivo: 'bloqueado' }
  }

  if (agora > dados.expiraEm) {
    return { sucesso: false, motivo: 'expirado' }
  }

  const hashInformado = gerarHmacOtp(codigoInformado, chaveOtp)
  const hashValido = dados.hash

  const bufferInformado = Buffer.from(hashInformado, 'hex')
  const bufferValido = Buffer.from(hashValido, 'hex')

  let valido = false
  if (bufferInformado.length === bufferValido.length) {
    valido = timingSafeEqual(bufferInformado, bufferValido)
  }

  if (!valido) {
    const novasTentativas = dados.tentativas + 1
    if (novasTentativas >= maxTentativas) {
      return { sucesso: false, motivo: 'bloqueado', tentativasRestantes: 0 }
    }
    return { sucesso: false, motivo: 'invalido', tentativasRestantes: maxTentativas - novasTentativas }
  }

  return { sucesso: true }
}
