import { Queue, Worker, type Job } from 'bullmq'
import { obterConexaoRedis } from './conexao.js'
import type { BancoDaEmpresa } from '../banco/conexao.js'

export type ComoEmpresa = <T>(empresaId: string, fn: (banco: BancoDaEmpresa) => Promise<T>) => Promise<T>

export type PayloadComEmpresa<T = unknown> = T & { empresaId: string }

export function criarFila<T = any>(nome: string) {
  return new Queue<PayloadComEmpresa<T>>(nome, {
    connection: obterConexaoRedis(),
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  })
}

export function criarWorker<T>(
  nome: string,
  comoEmpresa: ComoEmpresa,
  processador: (job: Job<PayloadComEmpresa<T>>, banco: BancoDaEmpresa) => Promise<void>,
  opcoes?: { concurrency?: number }
) {
  return new Worker<PayloadComEmpresa<T>>(
    nome,
    async (job) => {
      const { empresaId } = job.data
      if (!empresaId) {
        throw new Error(`Job da fila ${nome} sem empresaId`)
      }
      await comoEmpresa(empresaId, async (banco) => {
        await processador(job, banco)
      })
    },
    {
      connection: obterConexaoRedis(),
      concurrency: opcoes?.concurrency ?? 1,
    }
  )
}
