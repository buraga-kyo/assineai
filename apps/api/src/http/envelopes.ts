import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { envelopes } from '../banco/esquema/envelope.js'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'

export const rotasEnvelopes = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  app.post(
    '/envelopes',
    {
      config: { acesso: 'privado' },
      schema: {
        body: z.object({ titulo: z.string().min(1) }),
        response: { 201: z.object({ id: z.string().uuid() }) },
      },
    },
    async (request, reply) => {
      const { titulo } = request.body
      const id = await banco.comoEmpresa(request.usuario.empresaId, async (tx: BancoDaEmpresa) => {
        const [env] = await tx.insert(envelopes).values({ empresaId: request.usuario.empresaId, titulo }).returning({ id: envelopes.id })
        return env!.id
      })
      return reply.code(201).send({ id })
    }
  )

  app.get(
    '/envelopes',
    {
      config: { acesso: 'privado' },
    },
    async (request, reply) => {
      const lista = await banco.comoEmpresa(request.usuario.empresaId, async (tx: BancoDaEmpresa) => {
        return tx.select().from(envelopes)
      })
      return reply.send(lista)
    }
  )
}
