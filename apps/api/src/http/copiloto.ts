import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'
import { FabricaDeRedator } from '../redator/fabrica.js'
import { minutas } from '@assineai/modelos'
import Mustache from 'mustache'
import { randomUUID } from 'node:crypto'
import { envelopes, documentosEnvelope } from '../banco/esquema/envelope.js'
import { eq } from 'drizzle-orm'

export const rotasCopiloto = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  // Conversa com o copiloto (entrevista estruturada)
  app.post(
    '/copiloto/entrevista',
    {
      config: { acesso: 'sessao' },
      schema: {
        body: z.object({
          slugMinuta: z.string(),
          mensagem: z.string(),
          variaveisJaPreenchidas: z.record(z.string()).default({})
        })
      }
    },
    async (request, reply) => {
      // Mock do fluxo
      // Na vida real: passariamos a mensagem para o FabricaDeRedator junto com o schema Zod da minuta.
      // O Redator (via IA) tentaria extrair as variaveis usando completarEstruturado.
      const { slugMinuta, mensagem, variaveisJaPreenchidas } = request.body
      
      const minuta = minutas[slugMinuta as keyof typeof minutas]
      if (!minuta) throw new Error('Minuta não encontrada')
      
      // Mock: a IA detectou que o cara respondeu o nome
      const novasVariaveis = { ...variaveisJaPreenchidas }
      if (mensagem.toLowerCase().includes('empresa') || mensagem.includes('joão')) {
         novasVariaveis.contratanteNome = mensagem
      }

      // Vê o que falta preencher
      const chavesRequiridas = Object.keys(minuta.esquema.shape)
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

  // Geração do PDF (Mock via Typst)
  app.post(
    '/copiloto/gerar',
    {
      config: { acesso: 'sessao' },
      schema: {
        body: z.object({
          slugMinuta: z.string(),
          variaveis: z.record(z.string())
        })
      }
    },
    async (request, reply) => {
      const { slugMinuta, variaveis } = request.body
      const empresaId = request.sessao!.empresaId
      
      const minuta = minutas[slugMinuta as keyof typeof minutas]
      const mdRenderizado = Mustache.render(minuta.lerModelo(), variaveis)

      // Na vida real: Aqui rodaria child_process chamando o CLI do Typst
      // `typst compile template.typ saida.pdf` passando o MD
      
      // Vamos mockar gerando um envelope em rascunho com o ID
      const envelopeId = await banco.comoEmpresa(empresaId, async (tx: BancoDaEmpresa) => {
        const [envCriado] = await tx.insert(envelopes).values({
          empresaId,
          titulo: minuta.meta.titulo,
          estado: 'rascunho',
          codigo: 'ENV-' + Math.floor(Math.random() * 1000)
        }).returning({ id: envelopes.id })

        await tx.insert(documentosEnvelope).values({
          empresaId,
          envelopeId: envCriado!.id,
          nomeOriginal: `${slugMinuta}.pdf`,
          tamanhoBytes: 1024,
          caminhoStorage: 'mock/path.pdf'
        })

        return envCriado!.id
      })

      return reply.code(200).send({ ok: true, envelopeId })
    }
  )
}
