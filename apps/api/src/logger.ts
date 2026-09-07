// Logger pino da api. O redact esconde cookie, authorization e qualquer campo
// de senha, codigo_otp, token ou credenciais ate dois niveis de profundidade;
// o pino nao tem curinga profundo, por isso os tres formatos de cada chave.
//
// Convencao do repositorio: o codigo de 6 digitos em texto claro so viaja em
// campos chamados `codigo_otp`. `codigo` fica livre para codigo de erro
// ({ erro: { codigo } }) e identificador publico, e sai legivel no log.
import { pino, type DestinationStream, type Logger } from 'pino'
import type { Config } from './config.js'

const CHAVES_SECRETAS = ['senha', 'codigo_otp', 'token', 'credenciais', 'credenciais_cifradas']

export const CAMINHOS_OCULTOS = [
  'req.headers.cookie',
  'req.headers.authorization',
  ...CHAVES_SECRETAS.flatMap((chave) => [chave, `*.${chave}`, `*.*.${chave}`]),
]

export type OpcoesLogger = Pick<Config, 'LOG_NIVEL' | 'NODE_ENV'>

// `destino` serve aos testes, que capturam as linhas em memoria.
export function criarLogger(opcoes: OpcoesLogger, destino?: DestinationStream): Logger {
  const base = { level: opcoes.LOG_NIVEL, redact: { paths: CAMINHOS_OCULTOS, censor: '[oculto]' } }
  if (destino) return pino(base, destino)
  if (opcoes.NODE_ENV !== 'development') return pino(base)
  return pino({
    ...base,
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
    },
  })
}
