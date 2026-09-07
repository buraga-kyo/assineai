// Ponto de entrada do worker: valida o ambiente, avisa que esta pronto e fica
// vivo esperando as filas, que chegam com a issue #49.
import { carregarConfigOuSair } from './config.js'
import { criarLogger } from './logger.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)
const batimento = setInterval(() => log.debug('worker vivo'), 60_000)

for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(sinal, () => {
    clearInterval(batimento)
    log.info({ sinal }, 'worker encerrado')
  })
}

log.info({ ambiente: config.NODE_ENV }, 'worker pronto')
