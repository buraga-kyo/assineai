// Ponto de entrada do worker: valida o ambiente, avisa que esta pronto e fica
// vivo esperando as filas, que chegam com a issue #49.
import { carregarConfigOuSair } from './config.js'
import { criarLogger } from './logger.js'
import { criarBanco } from './banco/conexao.js'
import { fecharConexaoRedis } from './filas/conexao.js'
import { criarWorkerEntrada } from './filas/trabalhadores/entrada.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)
const banco = criarBanco(config.BANCO_URL)

const workerEntrada = criarWorkerEntrada(banco.comoEmpresa)

const batimento = setInterval(() => log.debug('worker vivo'), 60_000)

for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(sinal, async () => {
    clearInterval(batimento)
    log.info({ sinal }, 'encerrando worker...')
    await workerEntrada.close()
    await fecharConexaoRedis()
    await banco.fechar()
    log.info({ sinal }, 'worker encerrado')
    process.exit(0)
  })
}

log.info({ ambiente: config.NODE_ENV }, 'worker pronto')
