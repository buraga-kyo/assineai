import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { obra } from '../banco/esquema/obra.js'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'

export const rotasObras = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  // Lista todas as obras da empresa
  app.get(
    '/obras',
    {
      config: { acesso: 'sessao' },
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      
      const obras = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        return await tx.select().from(obra).where(eq(obra.empresaId, empresaId))
      })

      return reply.code(200).send(obras)
    }
  )

  // Criar uma nova obra (mock)
  app.post(
    '/obras',
    {
      config: { acesso: 'sessao' },
      schema: { body: z.object({ titulo: z.string(), hash: z.string() }) }
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      const { titulo, hash } = request.body
      const usuarioId = request.sessao!.usuarioId
      
      const [novaObra] = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        return await tx.insert(obra).values({
          empresaId,
          criadoPor: usuarioId,
          titulo,
          codigoPublico: 'OBR-' + Math.floor(Math.random() * 10000),
          arquivos: [{
            tipo: 'audio',
            hash: hash,
            caminho: 'mock/caminho.mp3',
            otsCaminho: 'mock/caminho.ots',
            ancorado: false
          }]
        }).returning()
      })

      // Na vida real a gente colocaria na fila de ancoragem:
      // filaAncoragem.add('ancorar_obra', { obraId: novaObra.id })

      return reply.code(201).send(novaObra)
    }
  )

  // Página pública de verificação
  app.get(
    '/o/:codigoPublico',
    {
      config: { acesso: 'publico' },
      schema: { params: z.object({ codigoPublico: z.string() }) }
    },
    async (request, reply) => {
      const { codigoPublico } = request.params
      
      const [obraDb] = await banco.bancoSistema.select().from(obra).where(eq(obra.codigoPublico, codigoPublico))
      
      if (!obraDb) {
        return reply.code(404).send({ erro: 'Obra não encontrada' })
      }

      // Retorna omitindo os ids internos e caminhos de S3
      return reply.code(200).send({
        titulo: obraDb.titulo,
        codigoPublico: obraDb.codigoPublico,
        criadoEm: obraDb.criadoEm,
        arquivos: (obraDb.arquivos as any[]).map(a => ({
          tipo: a.tipo,
          hash: a.hash,
          ancorado: a.ancorado
        }))
      })
    }
  )
}
