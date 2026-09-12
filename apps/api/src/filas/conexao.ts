import { Redis } from 'ioredis'
import { carregarConfigOuSair } from '../config.js'

let conexaoRedis: Redis | null = null

export function obterConexaoRedis(): Redis {
  if (!conexaoRedis) {
    const config = carregarConfigOuSair()
    conexaoRedis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  }
  return conexaoRedis
}

export async function fecharConexaoRedis(): Promise<void> {
  if (conexaoRedis) {
    await conexaoRedis.quit()
    conexaoRedis = null
  }
}
