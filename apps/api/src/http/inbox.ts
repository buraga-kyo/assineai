import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { conversa, mensagem } from '../banco/esquema/inbox.js'
import { FabricaDeCanais } from '../canais/fabrica.js'
import { canal } from '../banco/esquema/canais.js'
import { contatoCanal } from '../banco/esquema/contato.js'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'

export const rotasInbox = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  // Listar conversas
  app.get(
    '/inbox/conversas',
    {
      config: { acesso: 'sessao' },
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      
      const conversas = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        return await tx.select().from(conversa)
          .where(eq(conversa.empresaId, empresaId))
          .orderBy(desc(conversa.atualizadoEm))
      })

      return reply.code(200).send(conversas)
    }
  )

  // Listar mensagens de uma conversa
  app.get(
    '/inbox/conversas/:id/mensagens',
    {
      config: { acesso: 'sessao' },
      schema: { params: z.object({ id: z.string().uuid() }) }
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      const { id } = request.params
      
      const mensagens = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        return await tx.select().from(mensagem)
          .where(and(eq(mensagem.conversaId, id), eq(mensagem.empresaId, empresaId)))
          .orderBy(mensagem.criadoEm)
      })

      return reply.code(200).send(mensagens)
    }
  )

  // Enviar resposta pelo canal
  app.post(
    '/inbox/conversas/:id/mensagens',
    {
      config: { acesso: 'sessao' },
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ texto: z.string().min(1) })
      }
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      const { id } = request.params
      const { texto } = request.body
      
      await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        const [conv] = await tx.select().from(conversa).where(and(eq(conversa.id, id), eq(conversa.empresaId, empresaId)))
        if (!conv) throw new Error('Conversa não encontrada')

        const [canalDb] = await tx.select().from(canal).where(eq(canal.id, conv.canalId))
        const [contatoC] = await tx.select().from(contatoCanal).where(and(eq(contatoCanal.canalId, conv.canalId), eq(contatoCanal.contatoId, conv.contatoId)))

        if (canalDb && canalDb.credenciaisCifradas && contatoC) {
          const credenciais = FabricaDeCanais.decifrarCredenciais(canalDb.credenciaisCifradas)
          const driver = FabricaDeCanais.obter(canalDb.tipo)
          
          await driver.enviarMensagemDeTexto(contatoC.identidadeExterna, texto, credenciais)
        }

        await tx.insert(mensagem).values({
          empresaId,
          conversaId: conv.id,
          texto,
          enviadaPorNos: true,
          lida: true
        })
      })

      return reply.code(200).send({ ok: true })
    }
  )
}
