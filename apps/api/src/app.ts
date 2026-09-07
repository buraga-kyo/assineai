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
import { exigirAcesso } from './http/acesso.js'
import { responderNaoEncontrado, tratarErro } from './http/erros.js'
import type { Verificacoes } from './saude/dependencias.js'
import { rotasSaude } from './saude/rotas.js'

export type OpcoesApp = { logger: Logger; verificacoes: Verificacoes }

export function criarApp({ logger, verificacoes }: OpcoesApp) {
  const app = Fastify({ loggerInstance: logger }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.addHook('onRoute', exigirAcesso)
  app.setNotFoundHandler(responderNaoEncontrado)
  app.setErrorHandler(tratarErro)
  app.register(rotasSaude, { verificacoes })
  return app
}

export type App = ReturnType<typeof criarApp>
