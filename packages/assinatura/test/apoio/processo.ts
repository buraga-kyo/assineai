import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'

export interface Captura {
  argv: string[]
  /** Pasta temporária da selagem, achada pelo argumento @.../args.txt. */
  pasta: string | undefined
}

/** Lê /proc/<pid>/cmdline enquanto o processo roda: é o que um `ps` veria. */
export function capturarLinhaDeComando(pid: number): Captura {
  const argv = readFileSync(`/proc/${pid}/cmdline`, 'latin1')
    .split('\0')
    .filter((argumento) => argumento !== '')
  const argfile = argv.find((argumento) => argumento.startsWith('@'))
  return { argv, pasta: argfile === undefined ? undefined : dirname(argfile.slice(1)) }
}
