import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { certificado } from '../banco/esquema/certificado.js'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'
import { randomUUID } from 'node:crypto'
import { verificarCertificado } from '@assineai/assinatura'
import { ErroDaApi } from './erros.js'
import { cifrar } from '../canais/criptografia.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const jarPath = path.resolve(__dirname, '../../../../../../Arquivos/Permanente/JSignPdf.jar')

export const rotasCertificados = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  // Upload do .pfx
  app.post(
    '/certificados',
    {
      config: { acesso: 'sessao' }
      // Validado por fastify-multipart
    },
    async (request, reply) => {
      const parts = request.parts()
      let pfxBuffer: Buffer | null = null
      let senha = ''

      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'arquivo') {
          pfxBuffer = await part.toBuffer()
        } else if (part.type === 'field' && part.fieldname === 'senha') {
          senha = part.value as string
        }
      }

      if (!pfxBuffer || !senha) {
        throw new ErroDaApi(400, 'dados_invalidos', 'O arquivo .pfx e a senha são obrigatórios')
      }

      // Salva temporariamente para verificar
      const idTemp = randomUUID()
      const empresaId = request.sessao!.empresaId
      const caminhoS3 = `empresa/${empresaId}/certificado/${idTemp}.pfx`

      // Validar certificado usando JSignPdf
      // Aqui usamos um mock temporario de gravação para a ferramenta ler (na vida real ou refatoramos pra ler da memoria ou salva num tmp)
      // Como o verificarCertificado precisa de um caminho de arquivo físico:
      const fs = await import('node:fs/promises')
      const tmpFile = path.resolve(__dirname, `../../../../../../Arquivos/${idTemp}.pfx`)
      await fs.writeFile(tmpFile, pfxBuffer)
      
      let validade = new Date()
      try {
        const dadosCert = await verificarCertificado({ arquivo: tmpFile, senha, jar: jarPath })
        validade = dadosCert.validoAte
      } catch (e: any) {
        await fs.unlink(tmpFile).catch(() => {})
        throw new ErroDaApi(400, 'dados_invalidos', `Falha ao abrir certificado: ${e.message}`)
      }
      
      await fs.unlink(tmpFile).catch(() => {})

      // Cifra a senha para salvar no banco
      const senhaCifrada = cifrar(senha)

      // Upload para o S3
      await request.armazenamento.enviarArquivo(caminhoS3, pfxBuffer, 'application/x-pkcs12')

      // Insere no banco
      const [certDb] = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        // Limpa os antigos, a empresa só tem 1 ativo no MVP
        await tx.delete(certificado).where(eq(certificado.empresaId, empresaId))
        return await tx.insert(certificado).values({
          empresaId,
          caminhoStorage: caminhoS3,
          senhaCifrada,
          validoAte: validade
        }).returning()
      })

      return reply.code(201).send({ ok: true, id: certDb!.id, validoAte: validade })
    }
  )
}
