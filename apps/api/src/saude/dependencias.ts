// As tres checagens da rota /saude: banco (select 1 pelo pg), redis (ping) e
// storage (HeadBucket no S3). Cada uma tem 2 s para responder; o resultado
// diz se passou e quanto demorou. O motivo da falha fica so no log.
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'
import type { FastifyBaseLogger } from 'fastify'
import { Redis } from 'ioredis'
import { createTransport } from 'nodemailer'
import { Pool } from 'pg'
import type { Config } from '../config.js'

export type Estado = { ok: boolean; ms: number }
export type Verificacao = () => Promise<unknown>
export type Verificacoes = { banco: Verificacao; redis: Verificacao; storage: Verificacao; smtp: Verificacao }

export const LIMITE_MS = 2000

// Roda a checagem contra o relogio: falhou ou passou do limite, ok: false.
export async function medir(
  nome: string,
  verificacao: Verificacao,
  log: FastifyBaseLogger,
  limiteMs = LIMITE_MS,
): Promise<Estado> {
  const inicio = performance.now()
  let temporizador: NodeJS.Timeout | undefined
  const limite = new Promise<never>((_, rejeitar) => {
    temporizador = setTimeout(() => rejeitar(new Error(`passou de ${limiteMs} ms`)), limiteMs)
  })
  try {
    await Promise.race([verificacao(), limite])
    return { ok: true, ms: Math.round(performance.now() - inicio) }
  } catch (erro) {
    log.warn({ err: erro, dependencia: nome }, 'dependencia falhou na checagem de saude')
    return { ok: false, ms: Math.round(performance.now() - inicio) }
  } finally {
    clearTimeout(temporizador)
  }
}

// Clientes de verdade, um por dependencia, criados uma vez no boot. Nenhum
// tenta reconectar sem parar: a checagem que falhou responde rapido.
export function criarVerificacoes(config: Config, log: FastifyBaseLogger) {
  const banco = new Pool({
    connectionString: config.BANCO_URL,
    max: 1,
    connectionTimeoutMillis: LIMITE_MS,
  })
  banco.on('error', (erro) => log.warn({ err: erro }, 'conexao ociosa do banco caiu'))
  const redis = new Redis(config.REDIS_URL, {
    lazyConnect: true,
    connectTimeout: LIMITE_MS,
    maxRetriesPerRequest: 1,
  })
  // a primeira falha avisa em warn; as repetidas (o ioredis tenta de novo sem
  // parar) ficam em debug para nao inundar o log; volta a avisar quando reconecta
  let redisAvisou = false
  redis.on('error', (erro) => {
    log[redisAvisou ? 'debug' : 'warn']({ err: erro }, 'redis indisponivel')
    redisAvisou = true
  })
  redis.on('ready', () => {
    redisAvisou = false
  })
  const storage = new S3Client({
    endpoint: config.ARMAZENAMENTO_ENDPOINT,
    region: config.ARMAZENAMENTO_REGIAO,
    forcePathStyle: config.ARMAZENAMENTO_CAMINHO_FORCADO,
    credentials: {
      accessKeyId: config.ARMAZENAMENTO_CHAVE,
      secretAccessKey: config.ARMAZENAMENTO_SEGREDO,
    },
    maxAttempts: 1,
    requestHandler: { requestTimeout: LIMITE_MS, connectionTimeout: LIMITE_MS },
  })
  const smtp = config.SMTP_URL ? createTransport({ url: config.SMTP_URL }) : undefined
  const verificacoes: Verificacoes = {
    banco: () => banco.query('select 1'),
    redis: () => redis.ping(),
    storage: () => storage.send(new HeadBucketCommand({ Bucket: config.ARMAZENAMENTO_BUCKET })),
    smtp: () => (smtp ? smtp.verify() : Promise.reject(new Error('SMTP_URL nao configurado'))),
  }
  const fechar = async () => {
    if (smtp) smtp.close()
    redis.disconnect()
    storage.destroy()
    await banco.end()
  }
  return { verificacoes, fechar }
}
