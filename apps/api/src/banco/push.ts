// pnpm db:push: atalho de desenvolvimento que empurra o esquema direto, sem
// migration. Em producao e proibido; o esquema so muda por db:migrar.
import { spawnSync } from 'node:child_process'
import { carregarConfigDeMigracaoOuSair } from '../config.js'

const config = carregarConfigDeMigracaoOuSair()

if (config.NODE_ENV === 'production') {
  process.stderr.write('db:push nao roda em producao; use db:migrar\n')
  process.exit(1)
}

const resultado = spawnSync('pnpm', ['exec', 'drizzle-kit', 'push', ...process.argv.slice(2)], {
  stdio: 'inherit',
})
process.exit(resultado.status ?? 1)
