import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq, ilike, and, or } from 'drizzle-orm'
import { contato, etiqueta, contatoEtiqueta } from '../banco/esquema/contato.js'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'

export const rotasContatos = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  // Lista todos os contatos da empresa
  app.get(
    '/contatos',
    {
      config: { acesso: 'sessao' },
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      
      const contatos = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        return await tx.select().from(contato).where(eq(contato.empresaId, empresaId))
      })

      return reply.code(200).send(contatos)
    }
  )

  // Busca contatos por termo
  app.get(
    '/contatos/buscar',
    {
      config: { acesso: 'sessao' },
      schema: { querystring: z.object({ q: z.string() }) }
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      const { q } = request.query
      
      const contatos = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        return await tx.select().from(contato).where(
          and(
            eq(contato.empresaId, empresaId),
            or(ilike(contato.nome, `%${q}%`), ilike(contato.telefone, `%${q}%`), ilike(contato.email, `%${q}%`))
          )
        )
      })

      return reply.code(200).send(contatos)
    }
  )

  // Ocultar dados LGPD
  app.delete(
    '/contatos/:id/lgpd',
    {
      config: { acesso: 'sessao' },
      schema: { params: z.object({ id: z.string().uuid() }) }
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      const { id } = request.params
      
      await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        await tx.update(contato).set({
          nome: 'ANONIMIZADO',
          telefone: null,
          email: null,
          notas: null,
          lgpdApagado: true
        }).where(and(eq(contato.id, id), eq(contato.empresaId, empresaId)))
      })

      return reply.code(200).send({ ok: true })
    }
  )
}
