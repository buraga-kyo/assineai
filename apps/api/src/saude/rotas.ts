// GET /saude: roda as tres checagens em paralelo e responde 200 com todas ok
// ou 503 se alguma falhou, sempre com o estado de cada uma.
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { medir, type Verificacoes } from './dependencias.js'

const estado = z.object({ ok: z.boolean(), ms: z.number() })
const respostaSaude = z.object({
  ok: z.boolean(),
  dependencias: z.object({ banco: estado, redis: estado, storage: estado, smtp: estado }),
})
export type RespostaSaude = z.infer<typeof respostaSaude>

export const rotasSaude: FastifyPluginAsyncZod<{ verificacoes: Verificacoes }> = async (
  app,
  { verificacoes },
) => {
  app.get(
    '/saude',
    {
      config: { acesso: 'publico' },
      schema: { response: { 200: respostaSaude, 503: respostaSaude } },
    },
    async (request, reply) => {
      const [banco, redis, storage, smtp] = await Promise.all([
        medir('banco', verificacoes.banco, request.log),
        medir('redis', verificacoes.redis, request.log),
        medir('storage', verificacoes.storage, request.log),
        medir('smtp', verificacoes.smtp, request.log),
      ])
      const ok = banco.ok && redis.ok && storage.ok
      return reply.code(ok ? 200 : 503).send({ ok, dependencias: { banco, redis, storage, smtp } })
    },
  )
}
