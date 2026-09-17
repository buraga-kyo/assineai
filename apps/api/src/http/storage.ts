import { z } from 'zod'
import { ErroDaApi } from './erros.js'
import type { App } from '../app.js'
import { ValidadorPdfStream } from '../storage/validador.js'
import fastifyMultipart from '@fastify/multipart'
import { randomUUID } from 'node:crypto'

export async function rotasStorage(app: App) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB máximo real
      files: 1
    }
  })

  app.post(
    '/envelope/:idEnvelope/documento',
    { config: { acesso: 'sessao' } },
    async (request, reply) => {
      const sessao = request.sessao!
      const { idEnvelope } = request.params as { idEnvelope: string }
      
      const arquivo = await request.file()
      if (!arquivo) {
        throw new ErroDaApi(400, 'dados_invalidos', 'Nenhum arquivo enviado')
      }

      // Limite: 10 MB = 10 * 1024 * 1024
      const validador = new ValidadorPdfStream(10 * 1024 * 1024)
      
      // Quando ocorre erro no stream, o pipe é desfeito ou o erro é propagado
      // O s3 sdk usa a stream e pode retornar erro, o pipeline trata as promessas.
      const idDocumento = randomUUID()
      const caminhoS3 = `empresa/${sessao.empresaId}/envelope/${idEnvelope}/documento/${idDocumento}/original.pdf`

      try {
        const streamValida = arquivo.file.pipe(validador)
        await request.armazenamento.enviarArquivo(caminhoS3, streamValida, 'application/pdf')
      } catch (err: any) {
        if (err.name === 'ErroValidacaoPdf') {
          return reply.code(err.codigo).send({ erro: { codigo: 'upload_invalido', mensagem: err.message } })
        }
        throw err
      }

      const sha256 = validador.getSha256()

      return reply.code(201).send({ id: idDocumento, caminho: caminhoS3, sha256 })
    }
  )

  app.get(
    '/envelope/:idEnvelope/documento/:idDocumento/download',
    { config: { acesso: 'sessao' } },
    async (request, reply) => {
      const sessao = request.sessao!
      const { idEnvelope, idDocumento } = request.params as { idEnvelope: string, idDocumento: string }

      const caminhoS3 = `empresa/${sessao.empresaId}/envelope/${idEnvelope}/documento/${idDocumento}/original.pdf`
      
      const url = await request.armazenamento.gerarUrlDeDownload(caminhoS3, 600)

      return reply.code(200).send({ url })
    }
  )
}
