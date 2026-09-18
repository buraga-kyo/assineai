import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Config } from '../config.js'

export function criarClienteS3(config: Config) {
  const cliente = new S3Client({
    region: config.ARMAZENAMENTO_REGIAO,
    endpoint: config.ARMAZENAMENTO_ENDPOINT,
    credentials: {
      accessKeyId: config.ARMAZENAMENTO_CHAVE,
      secretAccessKey: config.ARMAZENAMENTO_SEGREDO,
    },
    forcePathStyle: config.ARMAZENAMENTO_CAMINHO_FORCADO,
  })

  return {
    async enviarArquivo(caminho: string, corpo: Buffer | Uint8Array | import('stream').Readable | string, contentType: string) {
      const comando = new PutObjectCommand({
        Bucket: config.ARMAZENAMENTO_BUCKET,
        Key: caminho,
        Body: corpo,
        ContentType: contentType,
      })
      await cliente.send(comando)
    },

    async baixarArquivo(caminho: string): Promise<Buffer> {
      const comando = new GetObjectCommand({
        Bucket: config.ARMAZENAMENTO_BUCKET,
        Key: caminho,
      })
      const resp = await cliente.send(comando)
      if (!resp.Body) throw new Error('Arquivo não encontrado no S3')
      const arrayBuffer = await resp.Body.transformToByteArray()
      return Buffer.from(arrayBuffer)
    },

    async gerarUrlDeDownload(caminho: string, expiracaoSegundos = 600) {
      const comando = new GetObjectCommand({
        Bucket: config.ARMAZENAMENTO_BUCKET,
        Key: caminho,
      })
      return await getSignedUrl(cliente, comando, { expiresIn: expiracaoSegundos })
    }
  }
}

export type Armazenamento = ReturnType<typeof criarClienteS3>
