// Monta o Fastify: logger, validacao e resposta por Zod, regra de acesso por
// rota, erro padrao e a rota de saude. Quem chama (servidor.ts e os testes)
// escolhe o logger e as verificacoes; por isso nada aqui toca rede sozinho.
import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { Redis } from 'ioredis'
import type { Config } from './config.js'
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
import { rotasTema } from './http/tema.js'
import { rotasStorage } from './http/storage.js'
import { rotasEnvelopes } from './http/envelopes.js'
import { rotasVerificacao } from './http/verificacao.js'
import { rotasCanais } from './http/canais.js'
import { rotasContatos } from './http/contatos.js'
import { rotasInbox } from './http/inbox.js'
import { rotasAssistente } from './http/redator.js'
import { rotasObras } from './http/obras.js'
import type { BancoDaEmpresa, criarBanco } from './banco/conexao.js'
import { criarClienteS3, type Armazenamento } from './storage/s3.js'

import { rotasAssinatura } from './http/assinatura.js'
import { rotasCertificados } from './http/certificados.js'

export type OpcoesApp = {
  logger: Logger
  verificacoes: Verificacoes
  banco: ReturnType<typeof criarBanco>
  config: Config
}

declare module 'fastify' {
  interface FastifyRequest {
    sessao?: { id: string; empresaId: string; usuarioId: string }
    banco: <T>(fn: (banco: BancoDaEmpresa) => Promise<T>) => Promise<T>
    armazenamento: Armazenamento
  }
  interface FastifyInstance {
    banco: ReturnType<typeof criarBanco>
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

export function criarApp({ logger, verificacoes, banco, config }: OpcoesApp) {
  const app = Fastify({ loggerInstance: logger, trustProxy: true }).withTypeProvider<ZodTypeProvider>()
  
  app.register(helmet, {
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true,
    frameguard: { action: 'deny' }
  })

  app.register(cors, {
    origin: config.CORS_ORIGENS.split(',').map(s => s.trim()),
    credentials: true,
  })

  // Para não vazar a conexão, conectamos o redis aqui e fechamos no onClose
  const redisRateLimit = config.NODE_ENV === 'test' ? null : new Redis(config.REDIS_URL, { maxRetriesPerRequest: null })
  app.register(rateLimit, {
    ...(redisRateLimit ? { redis: redisRateLimit } : {}),
    global: true,
    max: 1000,
    timeWindow: '1 minute'
  })
  app.addHook('onClose', async () => {
    if (redisRateLimit) redisRateLimit.disconnect()
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.addHook('onRoute', exigirAcesso)
  app.setNotFoundHandler(responderNaoEncontrado)
  app.setErrorHandler(tratarErro)

  // Hook anti-CSRF
  app.addHook('onRequest', async (request, reply) => {
    const metodosMutaveis = ['POST', 'PUT', 'DELETE', 'PATCH']
    if (metodosMutaveis.includes(request.method) && !request.headers['x-requisicao']) {
      return reply.code(403).send({ erro: { codigo: 'CSRF_REJEITADO', mensagem: 'Cabeçalho X-Requisicao ausente' } })
    }
  })

  // Decoradores vazios para tipagem rápida e consistente (evitando explicit-any)
  app.decorateRequest('sessao', undefined as never)
  app.decorateRequest('banco', undefined as never)
  app.decorateRequest('armazenamento', undefined as never)

  // O cliente S3 é injetado no request
  const armazenamento = criarClienteS3(config)

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
      request.armazenamento = armazenamento
    }
  })

  // Decoradores globais da instancia
  app.decorate('banco', banco)

  // Registro das rotas
  app.register(rotasSaude, { verificacoes })
  app.register(rotasUsuarios(banco))
  app.register(rotasSessao(banco))
  app.register(rotasTema)
  app.register(rotasStorage)
  app.register(rotasEnvelopes)
  app.register(rotasVerificacao)
  app.register(rotasCanais(banco))
  app.register(rotasContatos(banco))
  app.register(rotasInbox(banco))
  app.register(rotasAssistente(banco))
  app.register(rotasAssinatura)
  app.register(rotasObras(banco))
  app.register(rotasCertificados(banco))

  return app
}

export type App = ReturnType<typeof criarApp>
