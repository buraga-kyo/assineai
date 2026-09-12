// Monta o Fastify: logger, validacao e resposta por Zod, regra de acesso por
// rota, erro padrao e a rota de saude. Quem chama (servidor.ts e os testes)
// escolhe o logger e as verificacoes; por isso nada aqui toca rede sozinho.
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import type { Logger } from 'pino'
import * as crypto from 'node:crypto'
import { sql } from 'drizzle-orm'
import { exigirAcesso } from './http/acesso.js'
import { responderNaoEncontrado, tratarErro } from './http/erros.js'
import type { Verificacoes } from './saude/dependencias.js'
import { rotasSaude } from './saude/rotas.js'
import { rotasUsuarios } from './http/usuarios.js'
import { rotasSessao } from './http/sessao.js'
import type { BancoDaEmpresa, criarBanco } from './banco/conexao.js'

export type OpcoesApp = {
  logger: Logger
  verificacoes: Verificacoes
  banco: ReturnType<typeof criarBanco>
}

declare module 'fastify' {
  interface FastifyRequest {
    sessao?: { id: string; empresaId: string; usuarioId: string }
    banco: <T>(fn: (banco: BancoDaEmpresa) => Promise<T>) => Promise<T>
  }
}

type SessaoSistemaRow = {
  id: string
  empresa_id: string
  usuario_id: string
  expira_em: Date
  revogada_em: Date | null
}

function obterCookie(cookieHeader: string | undefined, nome: string): string | undefined {
  if (!cookieHeader) return undefined
  const cookies = cookieHeader.split(';')
  for (const c of cookies) {
    const [k, v] = c.trim().split('=')
    if (k === nome) return v
  }
  return undefined
}

export function criarApp({ logger, verificacoes, banco }: OpcoesApp) {
  const app = Fastify({ loggerInstance: logger }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.addHook('onRoute', exigirAcesso)
  app.setNotFoundHandler(responderNaoEncontrado)
  app.setErrorHandler(tratarErro)

  // Decoradores vazios para tipagem rápida e consistente (evitando explicit-any)
  app.decorateRequest('sessao', undefined as never)
  app.decorateRequest('banco', undefined as never)

  // Hook global de autenticação de sessão
  app.addHook('preHandler', async (request, reply) => {
    const acesso = request.routeOptions.config?.acesso

    if (acesso === 'publico') {
      return
    }

    if (acesso === 'sessao') {
      const cookieHeader = request.headers.cookie
      const token = obterCookie(cookieHeader, '__Host-sessao')

      if (!token) {
        return reply.code(401).send({ error: 'Não autenticado' })
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest()
      const resultado = await banco.bancoSistema.execute(
        sql`select * from buscar_sessao_sistema(${tokenHash})`,
      )
      const rows = resultado.rows as unknown as SessaoSistemaRow[]

      if (rows.length === 0) {
        return reply.code(401).send({ error: 'Sessão inválida ou expirada' })
      }

      const s = rows[0]!

      if (s.expira_em < new Date() || s.revogada_em) {
        return reply.code(401).send({ error: 'Sessão inválida ou expirada' })
      }

      request.sessao = {
        id: s.id,
        empresaId: s.empresa_id,
        usuarioId: s.usuario_id,
      }

      request.banco = <T>(fn: (banco: BancoDaEmpresa) => Promise<T>) => {
        return banco.comoEmpresa(s.empresa_id, fn)
      }
    }
  })

  // Registro das rotas
  app.register(rotasSaude, { verificacoes })
  app.register(rotasUsuarios(banco))
  app.register(rotasSessao(banco))

  return app
}

export type App = ReturnType<typeof criarApp>
