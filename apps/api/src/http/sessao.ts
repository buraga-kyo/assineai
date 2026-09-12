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
  senha: z.string().min(8),
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

// Hash simulado de argon2id para e-mails inexistentes (tempo constante)
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
      const { email, senha } = request.body

      // 1. Busca o usuário pelo email usando a função SECURITY DEFINER que bypassa RLS
      const resultado = await banco.bancoSistema.execute(
        sql`select * from buscar_usuario_sistema(${email.toLowerCase()})`,
      )
      const rows = resultado.rows as unknown as UsuarioSistemaRow[]

      if (rows.length === 0) {
        // Prevenção de timing attack/enumeração: executa hash simulado e falha
        await argon2.verify(DUMMY_HASH, senha)
        return reply.code(401).send({ error: 'E-mail ou senha incorretos' })
      }

      const u = rows[0]!

      // 2. Verifica se a conta está temporariamente bloqueada
      if (u.bloqueado_ate && new Date(u.bloqueado_ate) > new Date()) {
        return reply.code(429).send({ error: 'Conta temporariamente bloqueada por excesso de tentativas' })
      }

      // 3. Verifica a senha
      const senhaValida = await argon2.verify(u.senha_hash, senha)

      if (!senhaValida) {
        // Incrementa falhas e bloqueia após 10 erros consecutivos
        const novasFalhas = u.falhas_login + 1
        const bloqueadoAte = novasFalhas >= 10 ? new Date(Date.now() + 15 * 60 * 1000) : null // 15 min de bloqueio

        await banco.comoEmpresa(u.empresa_id, async (tx: BancoDaEmpresa) => {
          await tx
            .update(usuario)
            .set({ falhasLogin: novasFalhas, bloqueadoAte })
            .where(eq(usuario.id, u.id))
        })

        return reply.code(401).send({ error: 'E-mail ou senha incorretos' })
      }

      // 4. Sucesso: limpa falhas e gera a sessão
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

      // Set cookie com os atributos de segurança exigidos
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
