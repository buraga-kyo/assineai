import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'
import { FabricaDeRedator } from '../redator/fabrica.js'
// @ts-ignore
import { minutas } from '@assineai/modelos'
// @ts-ignore
import Mustache from 'mustache'
import { randomUUID } from 'node:crypto'
import { envelopes, documentosEnvelope } from '../banco/esquema/envelope.js'
import { eq } from 'drizzle-orm'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { writeFile, readFile, unlink } from 'node:fs/promises'
import { createReadStream } from 'node:fs'

const executar = promisify(execFile)

export const rotasAssistente = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  // Conversa com o copiloto (entrevista estruturada)
  app.post(
    '/assistente/entrevista',
    {
      config: { acesso: 'sessao' },
      schema: {
        body: z.object({
          slugMinuta: z.string(),
          mensagem: z.string(),
          variaveisJaPreenchidas: z.record(z.string(), z.any()).default({})
        })
      }
    },
    async (request, reply) => {
      const { slugMinuta, mensagem, variaveisJaPreenchidas } = request.body
      
      const minuta = minutas[slugMinuta as keyof typeof minutas]
      if (!minuta) throw new Error('Minuta não encontrada')
      
      // Mock: O assistente detectou que o usuário respondeu o nome
      const novasVariaveis = { ...variaveisJaPreenchidas }
      if (mensagem.toLowerCase().includes('empresa') || mensagem.includes('joão')) {
         novasVariaveis.contratanteNome = mensagem
      }

      // Vê o que falta preencher
      let schemaBase = minuta.esquema as any
      if (schemaBase._def.typeName === 'ZodEffects') {
        schemaBase = schemaBase._def.schema
      }
      
      const chavesRequiridas = Object.keys(schemaBase.shape || {})
      const chavesFaltando = chavesRequiridas.filter(c => !novasVariaveis[c])
      
      let resposta = ''
      if (chavesFaltando.length > 0) {
        resposta = `Entendi. E qual é o ${chavesFaltando[0]}?`
      } else {
        resposta = `Perfeito! Já tenho tudo que preciso. Posso gerar o contrato?`
      }

      return reply.code(200).send({
        resposta,
        variaveis: novasVariaveis,
        pronto: chavesFaltando.length === 0
      })
    }
  )

  app.post(
    '/assistente/gerar',
    {
      config: { acesso: 'sessao' },
      schema: {
        body: z.object({
          slugMinuta: z.string(),
          variaveis: z.record(z.string(), z.any())
        })
      }
    },
    async (request, reply) => {
      const { slugMinuta, variaveis } = request.body
      const empresaId = request.sessao!.empresaId
      
      const minuta = minutas[slugMinuta as keyof typeof minutas]
      const mdRenderizado = Mustache.render(minuta.lerModelo(), variaveis)

      // Conversão basica de Markdown para Typst
      let typstCode = mdRenderizado
        .replace(/^# (.*$)/gim, '= $1')
        .replace(/^## (.*$)/gim, '== $1')
        .replace(/^### (.*$)/gim, '=== $1')
        .replace(/\*\*(.*?)\*\*/g, '*$1*')

      // Prepara template
      typstCode = `
#set page(paper: "a4", margin: 2.5cm)
#set text(font: "Helvetica", size: 11pt)

${typstCode}
      `

      const idUnico = randomUUID()
      const arqTyp = join(tmpdir(), `${idUnico}.typ`)
      const arqPdf = join(tmpdir(), `${idUnico}.pdf`)
      
      await writeFile(arqTyp, typstCode)

      try {
        await executar('typst', ['compile', arqTyp, arqPdf])
      } catch (e: any) {
        await unlink(arqTyp).catch(()=>{})
        throw new Error('Falha ao gerar o PDF com Typst: ' + e.message)
      }

      const envelopeId = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        const [envCriado] = await tx.insert(envelopes).values({
          empresaId,
          titulo: minuta.meta.titulo,
          estado: 'rascunho',
          codigoPublico: 'ENV-' + Math.floor(Math.random() * 1000)
        }).returning({ id: envelopes.id })

        const caminhoS3 = `empresa/${empresaId}/envelope/${envCriado!.id}/documento/${idUnico}/original.pdf`
        
        // Faz o upload pro MinIO
        await request.armazenamento.enviarArquivo(caminhoS3, createReadStream(arqPdf), 'application/pdf')

        await tx.insert(documentosEnvelope).values({
          envelopeId: envCriado!.id,
          nome: `${slugMinuta}.pdf`,
          caminhoStorage: caminhoS3
        })

        return envCriado!.id
      })

      // Limpeza
      await unlink(arqTyp).catch(()=>{})
      await unlink(arqPdf).catch(()=>{})

      return reply.code(200).send({ ok: true, envelopeId })
    }
  )
}
