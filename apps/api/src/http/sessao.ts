import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { usuario } from '../banco/esquema/usuario.js'
import { sessao } from '../banco/esquema/sessao.js'
import * as argon2 from 'argon2'
import * as crypto from 'node:crypto'
import type { BancoDaEmpresa, criarBanco } from '../banco/conexao.js'

const loginSchema = z.object({
  email: z.string().email(),
  codigo: z.string().optional(),
  senha: z.string().optional(), // pra manter compatibilidade caso algo ainda use
})

const responseLoginSchema = z.object({
  ok: z.boolean(),
})

const responseSessaoSchema = z.object({
  ok: z.boolean(),
  usuario: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    nome: z.string(),
    papel: z.string(),
  }),
})

const errorSchema = z.object({
  error: z.string(),
})

const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$anVzdG9zdG9rZW4$dummyhashdummyhashdummyhashdummyhashdummyhash'

type UsuarioSistemaRow = {
  id: string
  empresa_id: string
  email: string
  senha_hash: string
  papel: 'dono' | 'agente' | 'leitura'
  falhas_login: number
  bloqueado_ate: string | null
}

export const rotasSessao = (banco: ReturnType<typeof criarBanco>): FastifyPluginAsyncZod => async (app) => {
  // Mock para o envio do OTP
  app.post(
    '/sessao/otp',
    {
      config: { acesso: 'publico' },
      schema: {
        body: z.object({ email: z.string().email(), tokenAntiRobo: z.string().optional() }),
        response: { 200: responseLoginSchema }
      }
    },
    async (request, reply) => {
      // Mock que diz pro app que enviou com sucesso
      return reply.code(200).send({ ok: true })
    }
  )

  // POST /sessao: Login
  app.post(
    '/sessao',
    {
      config: { acesso: 'publico' },
      schema: {
        body: loginSchema,
        response: {
          200: responseLoginSchema,
          401: errorSchema,
          429: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, codigo, senha } = request.body

      const resultado = await banco.bancoSistema.execute(
        sql`select * from buscar_usuario_sistema(${email.toLowerCase()})`,
      )
      const rows = resultado.rows as unknown as UsuarioSistemaRow[]

      if (rows.length === 0) {
        await argon2.verify(DUMMY_HASH, senha || codigo || '')
        return reply.code(401).send({ error: 'E-mail ou código incorretos' })
      }

      const u = rows[0]!

      if (u.bloqueado_ate && new Date(u.bloqueado_ate) > new Date()) {
        return reply.code(429).send({ error: 'Conta bloqueada' })
      }

      // Mock para aceitar qualquer login se for código e a conta existir
      // Em produção isso validaria contra o OTP
      const senhaValida = codigo ? true : await argon2.verify(u.senha_hash, senha || '')

      if (!senhaValida) {
        return reply.code(401).send({ error: 'E-mail ou código incorretos' })
      }

      await banco.comoEmpresa(u.empresa_id, async (tx: BancoDaEmpresa) => {
        await tx
          .update(usuario)
          .set({ falhasLogin: 0, bloqueadoAte: null })
          .where(eq(usuario.id, u.id))
      })

      const token = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(token).digest()

      await banco.comoEmpresa(u.empresa_id, async (tx: BancoDaEmpresa) => {
        await tx.insert(sessao).values({
          empresaId: u.empresa_id,
          usuarioId: u.id,
          tokenHash,
          expiraEm: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          ip: request.ip,
          userAgent: request.headers['user-agent'] || null,
        })
      })

      reply.header(
        'Set-Cookie',
        `__Host-sessao=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`,
      )

      return reply.code(200).send({ ok: true })
    },
  )

  // GET /sessao: Obter dados da sessão logada (quem sou)
  app.get(
    '/sessao',
    {
      config: { acesso: 'sessao' },
      schema: {
        response: {
          200: responseSessaoSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.sessao) {
        return reply.code(401).send({ error: 'Não autenticado' })
      }

      // Carrega o usuário autenticado de forma segura sob RLS
      const u = await request.banco(async (tx) => {
        const [linha] = await tx
          .select({ id: usuario.id, email: usuario.email, nome: usuario.nome, papel: usuario.papel })
          .from(usuario)
          .where(eq(usuario.id, request.sessao!.usuarioId))
        return linha
      })

      if (!u) {
        return reply.code(401).send({ error: 'Usuário não encontrado' })
      }

      return reply.code(200).send({ ok: true, usuario: u })
    },
  )

  // DELETE /sessao: Logout
  app.delete(
    '/sessao',
    {
      config: { acesso: 'sessao' },
      schema: {
        response: {
          200: responseLoginSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (request.sessao) {
        // Revoga a sessão ativa
        await request.banco(async (tx) => {
          await tx
            .update(sessao)
            .set({ revogadaEm: new Date() })
            .where(eq(sessao.id, request.sessao!.id))
        })
      }

      // Limpa o cookie
      reply.header(
        'Set-Cookie',
        '__Host-sessao=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
      )

      return reply.code(200).send({ ok: true })
    },
  )
}
