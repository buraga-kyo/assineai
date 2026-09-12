// Ponto de entrada do worker: valida o ambiente, avisa que esta pronto e fica
// vivo esperando as filas, que chegam com a issue #49.
import { carregarConfigOuSair } from './config.js'
import { criarLogger } from './logger.js'
import { criarBanco } from './banco/conexao.js'
import { fecharConexaoRedis } from './filas/conexao.js'
import { criarWorkerEntrada } from './filas/trabalhadores/entrada.js'
import { criarWorkerConvites } from './filas/trabalhadores/convites.js'
import { criarWorkerSelagem } from './filas/trabalhadores/selagem.js'
import { criarWorkerAncoragem } from './filas/trabalhadores/ancoragem.js'
import { criarWorkerNotificacoes } from './filas/trabalhadores/notificacoes.js'
import { criarWorkerManutencao } from './filas/trabalhadores/manutencao.js'

const config = carregarConfigOuSair()
const log = criarLogger(config)
const banco = criarBanco(config.BANCO_URL)

const workerEntrada = criarWorkerEntrada(banco.comoEmpresa)
const workerConvites = criarWorkerConvites(banco.comoEmpresa)
const workerSelagem = criarWorkerSelagem(banco.comoEmpresa)
const workerAncoragem = criarWorkerAncoragem(banco.comoEmpresa)
const workerNotificacoes = criarWorkerNotificacoes(banco.comoEmpresa)
const workerManutencao = criarWorkerManutencao(banco.comoEmpresa)

const batimento = setInterval(() => log.debug('worker vivo'), 60_000)

for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(sinal, async () => {
    clearInterval(batimento)
    log.info({ sinal }, 'encerrando worker...')
    await workerEntrada.close()
    await workerConvites.close()
    await workerSelagem.close()
    await workerAncoragem.close()
    await workerNotificacoes.close()
    await workerManutencao.close()
    await fecharConexaoRedis()
    await banco.fechar()
    log.info({ sinal }, 'worker encerrado')
    process.exit(0)
  })
}

log.info({ ambiente: config.NODE_ENV }, 'worker pronto')
