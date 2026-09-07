// Ponto de entrada HTTP: valida o ambiente, monta o app e escuta em PORTA_API.
// SIGTERM e SIGINT fecham o servidor sem cortar requisicao no meio.
import { criarApp } from './app.js'
import { carregarConfigOuSair } from './config.js'
import { criarLogger } from './logger.js'
import { criarVerificacoes } from './saude/dependencias.js'

const config = carregarConfigOuSair()
const logger = criarLogger(config)
const { verificacoes, fechar } = criarVerificacoes(config, logger)
const app = criarApp({ logger, verificacoes })
app.addHook('onClose', fechar)

for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(sinal, () => {
    app.log.info({ sinal }, 'encerrando a api')
    app.close().then(
      () => process.exit(0),
      (erro: unknown) => {
        app.log.error({ err: erro }, 'a api nao fechou limpa')
        process.exit(1)
      },
    )
  })
}

try {
  await app.listen({ port: config.PORTA_API, host: '0.0.0.0' })
} catch (erro) {
  app.log.error({ err: erro }, 'a api nao subiu')
  process.exit(1)
}
