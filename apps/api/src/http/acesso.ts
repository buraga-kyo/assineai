// Toda rota declara quem pode chamar: sessao (usuario logado), publico (sem
// login) ou webhook (assinatura do canal). Rota sem a declaracao nem chega a
// subir: o hook onRoute lanca na hora do registro.
import type { RouteOptions } from 'fastify'

export const ACESSOS = ['sessao', 'publico', 'webhook'] as const
export type Acesso = (typeof ACESSOS)[number]

declare module 'fastify' {
  interface FastifyContextConfig {
    acesso: Acesso
  }
}

export function exigirAcesso(rota: RouteOptions): void {
  const acesso: unknown = rota.config?.acesso
  if (typeof acesso === 'string' && (ACESSOS as readonly string[]).includes(acesso)) return
  const metodo = Array.isArray(rota.method) ? rota.method.join(',') : rota.method
  throw new Error(
    `a rota ${metodo} ${rota.url} nao declara acesso; use config.acesso com sessao, publico ou webhook`,
  )
}
