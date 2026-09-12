import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
import { carregarConfigOuSair } from '../config.js'

const ALGORITMO = 'aes-256-gcm'

export interface CredencialCifrada {
  versaoChave: string
  iv: string
  tag: string
  conteudo: string // Base64
}

export function cifrar(textoEmClaro: string): string {
  const config = carregarConfigOuSair()
  // Usamos a CHAVE_MESTRA do config (garantir q seja 32 bytes validos decodificando de base64 ou usando direto se for hex,
  // mas o template pede openssl rand -base64 32, então vamos decodificar de base64).
  const chaveBytes = Buffer.from(config.CHAVE_MESTRA, 'base64')
  
  if (chaveBytes.length !== 32) {
    throw new Error('CHAVE_MESTRA deve ter 32 bytes quando decodificada de base64')
  }

  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITMO, chaveBytes, iv)
  
  let cifrado = cipher.update(textoEmClaro, 'utf8', 'base64')
  cifrado += cipher.final('base64')
  const tag = cipher.getAuthTag()

  const payload: CredencialCifrada = {
    versaoChave: config.CHAVE_ID,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    conteudo: cifrado
  }

  return JSON.stringify(payload)
}

export function decifrar(cifradoJson: string): string {
  const config = carregarConfigOuSair()
  const payload: CredencialCifrada = JSON.parse(cifradoJson)
  
  // Numa implementação completa, teríamos um mapa de chaves antigas se a versão não bater com a atual.
  // Por enquanto o MVP só checa se a chave atual consegue decodificar.
  if (payload.versaoChave !== config.CHAVE_ID) {
    // console.warn(`Aviso: decifrando com CHAVE_ID=${config.CHAVE_ID} um dado que foi cifrado com CHAVE_ID=${payload.versaoChave}`)
  }

  const chaveBytes = Buffer.from(config.CHAVE_MESTRA, 'base64')
  const iv = Buffer.from(payload.iv, 'base64')
  const tag = Buffer.from(payload.tag, 'base64')

  const decipher = createDecipheriv(ALGORITMO, chaveBytes, iv)
  decipher.setAuthTag(tag)

  let decifrado = decipher.update(payload.conteudo, 'base64', 'utf8')
  decifrado += decipher.final('utf8')

  return decifrado
}
