import type { App } from '../app.js'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { envelopes, documentosEnvelope, signatariosEnvelope } from '../banco/esquema/envelope.js'
import { evidencia } from '../banco/esquema/evidencia.js'
import { ErroDaApi } from './erros.js'

export async function rotasEnvelopes(app: App) {
  app.post(
    '/envelopes',
    {
      config: { acesso: 'sessao' },
      schema: {
        body: z.object({ titulo: z.string().min(1) }),
        response: { 201: z.object({ id: z.string().uuid() }) },
      },
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const id = await request.banco(async (tx) => {
        const [env] = await tx
          .insert(envelopes)
          .values({ empresaId: sessao.empresaId, titulo: request.body.titulo })
          .returning({ id: envelopes.id })
        return env!.id
      })
      return reply.code(201).send({ id })
    }
  )

  app.get(
    '/envelopes',
    {
      config: { acesso: 'sessao' },
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const lista = await request.banco(async (tx) => {
        return tx.select().from(envelopes).where(eq(envelopes.empresaId, sessao.empresaId))
      })
      return reply.send(lista)
    }
  )

  app.get(
    '/envelopes/:id',
    {
      config: { acesso: 'sessao' },
      schema: { params: z.object({ id: z.string().uuid() }) }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const envelopeId = request.params.id

      const env = await request.banco(async (tx) => {
        const result = await tx.select().from(envelopes).where(and(eq(envelopes.id, envelopeId), eq(envelopes.empresaId, sessao.empresaId)))
        return result[0]
      })

      if (!env) throw new ErroDaApi(404, 'nao_encontrado', 'Envelope não encontrado')

      return reply.send(env)
    }
  )

  app.patch(
    '/envelopes/:id',
    {
      config: { acesso: 'sessao' },
      schema: { 
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ titulo: z.string().min(1) })
      }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const envelopeId = request.params.id

      const env = await request.banco(async (tx) => {
        const [result] = await tx.update(envelopes)
          .set({ titulo: request.body.titulo })
          .where(and(eq(envelopes.id, envelopeId), eq(envelopes.empresaId, sessao.empresaId)))
          .returning()
        return result
      })

      if (!env) throw new ErroDaApi(404, 'nao_encontrado', 'Envelope não encontrado')

      return reply.send(env)
    }
  )

  app.post(
    '/envelopes/:id/signatarios',
    {
      config: { acesso: 'sessao' },
      schema: { 
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ nome: z.string().min(1), email: z.string().email() })
      }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const envelopeId = request.params.id

      const sigId = await request.banco(async (tx) => {
        const env = await tx.select().from(envelopes).where(and(eq(envelopes.id, envelopeId), eq(envelopes.empresaId, sessao.empresaId)))
        if (!env.length) throw new ErroDaApi(404, 'nao_encontrado', 'Envelope não encontrado')
        
        const [sig] = await tx.insert(signatariosEnvelope).values({
          envelopeId,
          nome: request.body.nome,
          email: request.body.email,
        }).returning({ id: signatariosEnvelope.id })
        
        return sig!.id
      })

      return reply.code(201).send({ id: sigId })
    }
  )

  app.delete(
    '/envelopes/:idEnvelope/signatarios/:idSignatario',
    {
      config: { acesso: 'sessao' },
      schema: { params: z.object({ idEnvelope: z.string().uuid(), idSignatario: z.string().uuid() }) }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const { idEnvelope, idSignatario } = request.params

      await request.banco(async (tx) => {
        const env = await tx.select().from(envelopes).where(and(eq(envelopes.id, idEnvelope), eq(envelopes.empresaId, sessao.empresaId)))
        if (!env.length) throw new ErroDaApi(404, 'nao_encontrado', 'Envelope não encontrado')
        
        await tx.delete(signatariosEnvelope).where(and(eq(signatariosEnvelope.id, idSignatario), eq(signatariosEnvelope.envelopeId, idEnvelope)))
      })

      return reply.code(204).send()
    }
  )

  app.post(
    '/envelopes/:id/documentos',
    {
      config: { acesso: 'sessao' },
      schema: { params: z.object({ id: z.string().uuid() }) }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const envelopeId = request.params.id
      const arquivo = await request.file()

      if (!arquivo) throw new ErroDaApi(400, 'dados_invalidos', 'Arquivo não enviado')
      if (arquivo.mimetype !== 'application/pdf') throw new ErroDaApi(415, 'dados_invalidos', 'Só aceitamos PDF')

      await request.banco(async (tx) => {
        const env = await tx.select().from(envelopes).where(and(eq(envelopes.id, envelopeId), eq(envelopes.empresaId, sessao.empresaId)))
        if (!env.length) throw new ErroDaApi(404, 'nao_encontrado', 'Envelope não encontrado')

        const [docDb] = await tx.insert(documentosEnvelope).values({
          empresaId: sessao.empresaId,
          envelopeId,
          nomeOriginal: arquivo.filename,
          tamanhoBytes: 0, // Será atualizado se o S3 retornar ou depois
          caminhoStorage: `pendente`
        }).returning({ id: documentosEnvelope.id })

        const docId = docDb!.id
        const caminhoS3 = `empresa/${sessao.empresaId}/envelope/${envelopeId}/documento/${docId}/original.pdf`
        
        await request.armazenamento.enviarArquivo(caminhoS3, arquivo.file, 'application/pdf')
        
        await tx.update(documentosEnvelope).set({ caminhoStorage: caminhoS3 }).where(eq(documentosEnvelope.id, docId))
      })

      return reply.code(201).send({ ok: true })
    }
  )

  app.post(
    '/envelopes/:id/enviar',
    {
      config: { acesso: 'sessao' },
      schema: { params: z.object({ id: z.string().uuid() }) }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const envelopeId = request.params.id

      await request.banco(async (tx) => {
        const env = await tx.select().from(envelopes).where(and(eq(envelopes.id, envelopeId), eq(envelopes.empresaId, sessao.empresaId)))
        if (!env.length) throw new ErroDaApi(404, 'nao_encontrado', 'Envelope não encontrado')
        
        // Verifica se tem documentos
        const docs = await tx.select().from(documentosEnvelope).where(eq(documentosEnvelope.envelopeId, envelopeId))
        if (!docs.length) throw new ErroDaApi(422, 'dados_invalidos', 'Envelope precisa ter ao menos um documento')

        // Verifica se tem signatários
        const sigs = await tx.select().from(signatariosEnvelope).where(eq(signatariosEnvelope.envelopeId, envelopeId))
        if (!sigs.length) throw new ErroDaApi(422, 'dados_invalidos', 'Envelope precisa ter ao menos um signatário')

        // Atualiza estado
        await tx.update(envelopes).set({ estado: 'pendente' }).where(eq(envelopes.id, envelopeId))
        
        // No mundo real aqui postaria na fila de convites
      })

      return reply.code(200).send({ mensagem: 'Enviado com sucesso' })
    }
  )
  
  app.post(
    '/envelopes/:id/cancelar',
    {
      config: { acesso: 'sessao' },
      schema: { params: z.object({ id: z.string().uuid() }) }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const envelopeId = request.params.id

      await request.banco(async (tx) => {
        const env = await tx.select().from(envelopes).where(and(eq(envelopes.id, envelopeId), eq(envelopes.empresaId, sessao.empresaId)))
        if (!env.length) throw new ErroDaApi(404, 'nao_encontrado', 'Envelope não encontrado')
        
        await tx.update(envelopes).set({ estado: 'cancelado' }).where(eq(envelopes.id, envelopeId))
      })

      return reply.code(200).send({ mensagem: 'Cancelado com sucesso' })
    }
  )

  app.get(
    '/envelopes/:id/evidencias',
    {
      config: { acesso: 'sessao' },
      schema: { params: z.object({ id: z.string().uuid() }) }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const envelopeId = request.params.id

      const evs = await request.banco(async (tx) => {
        return tx.select().from(evidencia).where(and(eq(evidencia.envelopeId, envelopeId), eq(evidencia.empresaId, sessao.empresaId)))
      })

      return reply.send(evs)
    }
  )
}
