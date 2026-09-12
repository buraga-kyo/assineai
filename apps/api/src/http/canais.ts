import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { canal, contatoCanal, eventoWebhook, TipoCanal, CANAIS } from '../banco/esquema/canais.js'
import { FabricaDeCanais } from '../canais/fabrica.js'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'
import { randomBytes } from 'node:crypto'

// Rota para gerenciar canais e receber webhooks
export const rotasCanais = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  // Lista todos os canais da empresa logada
  app.get(
    '/canais',
    {
      config: { acesso: 'sessao' },
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      
      const canaisDb = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        return await tx.select().from(canal).where(eq(canal.empresaId, empresaId))
      })

      // Retorna omitindo as credenciais cifradas
      return reply.code(200).send(canaisDb.map(c => ({
        id: c.id,
        tipo: c.tipo,
        estado: c.estado,
        webhookSegredo: c.webhookSegredo,
        metadados: c.metadados
      })))
    }
  )

  // Webhook: Rota pública para receber eventos dos provedores
  app.post(
    '/webhook/:canalId/:segredo',
    {
      config: { acesso: 'publico' },
      schema: {
        params: z.object({
          canalId: z.string().uuid(),
          segredo: z.string()
        })
      }
    },
    async (request, reply) => {
      const { canalId, segredo } = request.params
      const payload = request.body

      // Busca o canal burlando RLS pq o provedor nao tem sessao
      const [canalDb] = await banco.bancoSistema
        .select()
        .from(canal)
        .where(and(eq(canal.id, canalId), eq(canal.webhookSegredo, segredo)))

      if (!canalDb) {
        // Retorna 404 pra nao vazar q o canal existe com outro segredo
        return reply.code(404).send()
      }

      // Grava o evento para processamento async antes de responder
      await banco.bancoSistema.insert(eventoWebhook).values({
        empresaId: canalDb.empresaId,
        canalId: canalDb.id,
        payload: payload as any
      })

      // Na vida real a gente colocaria um job na fila pra processar (ex: entrada:processar_mensagem)
      // filaEntrada.add('processar_mensagem', { canalId: canalDb.id, ... })

      return reply.code(200).send({ ok: true })
    }
  )
}
