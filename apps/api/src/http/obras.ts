import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { obra } from '../banco/esquema/obra.js'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'
import { randomUUID } from 'node:crypto'

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

  // Criar uma nova obra com upload real
  app.post(
    '/obras',
    {
      config: { acesso: 'sessao' }
      // Validado no corpo da função via multipart
    },
    async (request, reply) => {
      const empresaId = request.sessao!.empresaId
      const usuarioId = request.sessao!.usuarioId
      
      const parts = request.parts()
      let titulo = ''
      const arquivosRecebidos: { tipo: string, buffer: Buffer, nomeOriginal: string }[] = []

      for await (const part of parts) {
        if (part.type === 'field' && part.fieldname === 'titulo') {
          titulo = part.value as string
        } else if (part.type === 'file') {
          arquivosRecebidos.push({
            tipo: part.fieldname === 'audio' ? 'audio' : 'documento',
            buffer: await part.toBuffer(),
            nomeOriginal: part.filename
          })
        }
      }

      if (!titulo || arquivosRecebidos.length === 0) {
        return reply.code(400).send({ erro: 'Título e ao menos um arquivo são obrigatórios' })
      }

      const idObra = randomUUID()
      const crypto = await import('node:crypto')
      
      const arquivosDoBanco: { tipo: string, hash: string, caminho: string, otsCaminho: string | null, ancorado: boolean }[] = []
      
      for (const arq of arquivosRecebidos) {
        const hash = crypto.createHash('sha256').update(arq.buffer).digest('hex')
        const caminhoS3 = `empresa/${empresaId}/obras/${idObra}/${arq.nomeOriginal}`
        
        await request.armazenamento.enviarArquivo(caminhoS3, arq.buffer, arq.tipo === 'audio' ? 'audio/mpeg' : 'application/pdf')
        
        arquivosDoBanco.push({
          tipo: arq.tipo,
          hash,
          caminho: caminhoS3,
          otsCaminho: null,
          ancorado: false
        })
      }
      
      const [novaObra] = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        return await tx.insert(obra).values({
          id: idObra,
          empresaId,
          criadoPor: usuarioId,
          titulo,
          codigoPublico: 'OBR-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
          arquivos: arquivosDoBanco
        }).returning()
      })

      const { filaAncoragem } = await import('../filas/trabalhadores/ancoragem.js')
      await filaAncoragem.add('ancorar_obra', { obraId: novaObra!.id })

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
