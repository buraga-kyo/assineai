// Apoio dos testes: app com logger em memoria e verificacoes falsas, sem rede.
import type { DestinationStream } from 'pino'
import { criarApp } from '../src/app.js'
import { criarLogger } from '../src/logger.js'
import type { Config } from '../src/config.js'
import type { Verificacoes } from '../src/saude/dependencias.js'
import { BANCO_URL } from './config.js'
import { criarBanco } from '../src/banco/conexao.js'

export function capturarLog() {
  const linhas: string[] = []
  const destino: DestinationStream = {
    write: (linha: string) => {
      linhas.push(linha)
    },
  }
  const logger = criarLogger({ LOG_NIVEL: 'info', NODE_ENV: 'test' }, destino)
  return { linhas, logger, texto: () => linhas.join('') }
}

export const passa = async () => 'ok'
export const falha = async () => {
  throw new Error('caiu')
}

export function criarAppDeTeste(verificacoes: Partial<Verificacoes> = {}) {
  const log = capturarLog()
  const banco = criarBanco(BANCO_URL ?? 'postgres://assineai_app:app_dev@localhost:5432/assineai')
  const config: Config = {
    NODE_ENV: 'test',
    PORTA_API: 3000,
    LOG_NIVEL: 'info',
    BANCO_URL: BANCO_URL ?? 'postgres://assineai_app:app_dev@localhost:5432/assineai',
    REDIS_URL: 'redis://localhost:6379',
    ARMAZENAMENTO_ENDPOINT: 'http://localhost:9000',
    ARMAZENAMENTO_REGIAO: 'us-east-1',
    ARMAZENAMENTO_BUCKET: 'teste',
    ARMAZENAMENTO_CHAVE: 'teste',
    ARMAZENAMENTO_SEGREDO: 'teste',
    ARMAZENAMENTO_CAMINHO_FORCADO: true,
    ARMAZENAMENTO_LIMITE_TAMANHO: 10 * 1024 * 1024,
    CHAVE_OTP: '01234567890123456',
    OTP_VALIDADE_MIN: 10,
    OTP_TENTATIVAS: 5,
    CORS_ORIGENS: 'http://localhost:5173',
  }
  const app = criarApp({
    logger: log.logger,
    verificacoes: { banco: passa, redis: passa, storage: passa, smtp: passa, ...verificacoes },
    banco,
    config,
  })
  app.addHook('onClose', async () => {
    await banco.fechar()
  })
  return { app, ...log }
}
