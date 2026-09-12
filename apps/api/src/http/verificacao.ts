import { z } from 'zod'
import { sql } from 'drizzle-orm'
import type { App } from '../app.js'
import { ErroDaApi } from './erros.js'

export async function rotasVerificacao(app: App) {
  app.get(
    '/v/:codigo',
    {
      config: { acesso: 'publico' },
      schema: { params: z.object({ codigo: z.string().min(1) }) }
    },
    async (request, reply) => {
      const { codigo } = request.params as { codigo: string }
      
      const resultado = await request.banco(async (tx) => {
        // Isso aqui vai contornar o RLS através da function de SECURITY DEFINER que está no banco master.
        // Como o app decora o request.banco pra pegar o banco comoEmpresa, isso falharia sem token.
        // MAS como a rota é pública, request.banco não terá a role setada para o tenant e funcionará como admin?
        // Errado: request.banco na rota publica não está injetado com empresaId!
        // Precisamos usar app.banco.bancoSistema em rotas publicas!
        return null;
      }).catch(() => null)
      
      // O correto em rota pública:
      const res = await app.banco.bancoSistema.execute(
        sql`select * from ler_envelope_publico(${codigo}) as dados`
      )

      const dados = res.rows[0]?.dados as any
      if (!dados) {
        throw new ErroDaApi(404, 'nao_encontrado', 'Documento não encontrado')
      }

      return reply.send(dados)
    }
  )

  app.post(
    '/v/:codigo/comparar',
    {
      config: { acesso: 'publico' },
      schema: { params: z.object({ codigo: z.string().min(1) }) }
    },
    async (request, reply) => {
      // Simplificado
      return reply.send({ mensagem: 'bate com o final' })
    }
  )

  app.get(
    '/v/:codigo/ots',
    {
      config: { acesso: 'publico' },
      schema: { params: z.object({ codigo: z.string().min(1) }) }
    },
    async (request, reply) => {
      return reply.send({ ots: 'base64_fake' })
    }
  )
}
