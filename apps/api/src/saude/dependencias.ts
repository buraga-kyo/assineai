// As tres checagens da rota /saude: banco (select 1 pelo pg), redis (ping) e
// storage (HeadBucket no S3). Cada uma tem 2 s para responder; o resultado
// diz se passou e quanto demorou. O motivo da falha fica so no log.
import type { FastifyBaseLogger } from 'fastify'

export type Estado = { ok: boolean; ms: number }
export type Verificacao = () => Promise<unknown>
export type Verificacoes = { banco: Verificacao; redis: Verificacao; storage: Verificacao }

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
