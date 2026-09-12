import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { empresa } from '../banco/esquema/empresa.js'
import { usuario } from '../banco/esquema/usuario.js'
import * as argon2 from 'argon2'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'

const requestSchema = z.object({
  nomeEmpresa: z.string().min(2),
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8),
})

const responseSchema = z.object({
  ok: z.boolean(),
  empresaId: z.string().uuid(),
  usuarioId: z.string().uuid(),
})

export const rotasUsuarios = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  app.post(
    '/usuarios',
    {
      config: { acesso: 'publico' },
      schema: {
        body: requestSchema,
        response: {
          201: responseSchema,
        },
      },
    },
    async (request, reply) => {
      const { nomeEmpresa, nome, email, senha } = request.body

      // 1. Cria a empresa usando o bancoSistema (que permite inserções de nova empresa)
      const slug = `${nomeEmpresa.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
      const [empresaCriada] = await banco.bancoSistema
        .insert(empresa)
        .values({ nome: nomeEmpresa, slug })
        .returning({ id: empresa.id })

      if (!empresaCriada) {
        throw new Error('Falha ao criar empresa')
      }

      const newEmpresaId = empresaCriada.id

      // 2. Cria o usuário dono sob o escopo da empresa para atender RLS
      const senhaHash = await argon2.hash(senha)

      const usuarioCriadoId = await banco.comoEmpresa(newEmpresaId, async (tx: BancoDaEmpresa) => {
        const [u] = await tx
          .insert(usuario)
          .values({
            empresaId: newEmpresaId,
            email: email.toLowerCase(),
            nome,
            senhaHash,
            papel: 'dono',
            emailConfirmadoEm: new Date(), // Ativa o e-mail no ato do cadastro para simplificar o MVP
          })
          .returning({ id: usuario.id })
        return u!.id
      })

      return reply.code(201).send({
        ok: true,
        empresaId: newEmpresaId,
        usuarioId: usuarioCriadoId,
      })
    },
  )
}
