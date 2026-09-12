import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { empresa } from '../banco/esquema/empresa.js'
import type { App } from '../app.js'
import { validarContrasteWcag } from '../utilidades/cores.js'
import { ErroDaApi } from './erros.js'
import fastifyMultipart from '@fastify/multipart'

// Baseado na issue, validamos com Zod
export const esquemaTema = z.object({
  logo: z.string().url().optional(),
  paleta: z.object({
    primaria: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
    fundo: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
    texto: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
  }),
  fonte: z.string().optional(),
  textos: z.record(z.string(), z.string()).optional(),
  posicoes: z.record(z.string(), z.string()).optional()
})

const galeriaDeTemas = [
  { nome: 'Advocacia Clássica', tema: { paleta: { primaria: '#8B0000', fundo: '#FFFFFF', texto: '#333333' }, fonte: 'Times New Roman' } },
  { nome: 'Tecnologia Moderna', tema: { paleta: { primaria: '#007BFF', fundo: '#F8F9FA', texto: '#212529' }, fonte: 'Inter' } },
]

const temaPadrao = galeriaDeTemas[0]!.tema

export async function rotasTema(app: App) {
  // Apenas endpoints que precisem de multipart registrarão o parse individualmente
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB
    }
  })

  app.get(
    '/tema',
    {
      config: { acesso: 'sessao' },
      schema: { response: { 200: z.object({ tema: esquemaTema.nullable() }) } }
    },
    async (request) => {
      const sessao = request.sessao!
      const resultado = await request.banco(async (banco) => {
        return banco.select({ tema: empresa.tema }).from(empresa).where(eq(empresa.id, sessao.empresaId)).limit(1)
      })
      const temaAtual = resultado[0]?.tema ?? temaPadrao
      return { tema: temaAtual as z.infer<typeof esquemaTema> }
    }
  )

  app.get(
    '/tema/galeria',
    {
      config: { acesso: 'sessao' },
    },
    async () => {
      return { galeria: galeriaDeTemas }
    }
  )

  app.put(
    '/tema',
    {
      config: { acesso: 'sessao' },
      schema: { body: esquemaTema }
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const novoTema = request.body as z.infer<typeof esquemaTema>

      // Validação de contraste (C3)
      if (!validarContrasteWcag(novoTema.paleta.texto, novoTema.paleta.fundo)) {
        return reply.code(400).send({ aviso: 'A paleta enviada possui baixo contraste (abaixo do padrão WCAG AA).' })
      }

      await request.banco(async (banco) => {
        await banco.update(empresa).set({ tema: novoTema }).where(eq(empresa.id, sessao.empresaId))
      })

      return reply.code(204).send()
    }
  )

  app.post(
    '/tema/logo',
    {
      config: { acesso: 'sessao' },
    },
    async (request, reply) => {
      const sessao = request.sessao!
      const arquivo = await request.file()

      if (!arquivo) {
        throw new ErroDaApi(400, 'dados_invalidos', 'Nenhum arquivo enviado')
      }

      if (arquivo.mimetype !== 'image/png' && arquivo.mimetype !== 'image/svg+xml') {
        throw new ErroDaApi(415, 'dados_invalidos', 'Apenas imagens PNG ou SVG são aceitas')
      }

      // No ambiente real seria feito stream para o S3.
      // O limite já está imposto pelo fastifyMultipart em 2MB.
      
      const stream = arquivo.file
      let tamanho = 0
      for await (const pedaco of stream) {
        tamanho += pedaco.length
      }

      // Salvamos a url simbólica
      const urlFake = `https://storage.exemplo.com/empresa/${sessao.empresaId}/logo.png`
      
      // Update do tema
      await request.banco(async (banco) => {
        const resultado = await banco.select({ tema: empresa.tema }).from(empresa).where(eq(empresa.id, sessao.empresaId)).limit(1)
        const temaAtual: any = resultado[0]?.tema ?? temaPadrao
        temaAtual.logo = urlFake
        await banco.update(empresa).set({ tema: temaAtual }).where(eq(empresa.id, sessao.empresaId))
      })

      return reply.code(200).send({ url: urlFake })
    }
  )
}
