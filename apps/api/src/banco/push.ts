// pnpm db:push: atalho de desenvolvimento que empurra o esquema direto, sem
// migration. Em producao e proibido; o esquema so muda por db:migrar.
import { spawnSync } from 'node:child_process'
import { emProducao } from '../config.js'

// a recusa vem antes de qualquer credencial: em producao a mensagem e sempre
// esta, mesmo sem BANCO_URL_MIGRACAO no ambiente (o drizzle-kit le a URL
// sozinho pelo drizzle.config.ts)
if (emProducao()) {
  process.stderr.write('db:push nao roda em producao; use db:migrar\n')
  process.exit(1)
}

const resultado = spawnSync('pnpm', ['exec', 'drizzle-kit', 'push', ...process.argv.slice(2)], {
  stdio: 'inherit',
})
process.exit(resultado.status ?? 1)
