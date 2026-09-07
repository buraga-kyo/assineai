// pnpm db:migrar: aplica as migrations pendentes com BANCO_URL_MIGRACAO e sai.
// Saida 0 com tudo aplicado (ou nada a fazer), 1 com erro e a mensagem no log.
import { carregarConfigDeMigracaoOuSair } from '../config.js'
import { criarLogger } from '../logger.js'
import { rodarMigracoes } from './migracao.js'

const config = carregarConfigDeMigracaoOuSair()
const log = criarLogger(config)

try {
  await rodarMigracoes(config.BANCO_URL_MIGRACAO, log)
  process.exit(0)
} catch (erro) {
  log.error({ err: erro }, 'a migracao falhou')
  process.exit(1)
}
