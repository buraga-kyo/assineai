// Apoio dos testes: app com logger em memoria e verificacoes falsas, sem rede.
import type { DestinationStream } from 'pino'
import { criarApp } from '../src/app.js'
import { criarLogger } from '../src/logger.js'
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
  const app = criarApp({
    logger: log.logger,
    verificacoes: { banco: passa, redis: passa, storage: passa, smtp: passa, ...verificacoes },
    banco,
  })
  app.addHook('onClose', async () => {
    await banco.fechar()
  })
  return { app, ...log }
}
