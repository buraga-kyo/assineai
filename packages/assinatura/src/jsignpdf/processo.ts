import { spawn } from 'node:child_process'
import { ErroJavaIndisponivel, redigir } from './erros.js'

export const TIMEOUT_PADRAO_MS = 60_000
const OPCOES_JVM = ['-Xmx256m', '-Djava.awt.headless=true']

export interface OpcoesDoJava {
  javaBin: string
  argfile: string
  timeoutMs: number
  /** Senhas que não podem aparecer em stdout nem stderr. */
  segredos: readonly string[]
  aoIniciar?: ((pid: number) => void) | undefined
}

export interface SaidaDoJava {
  codigo: number | null
  sinal: NodeJS.Signals | null
  stdout: string
  stderr: string
  duracaoMs: number
}

/** Roda `java @argfile` e devolve código, sinal e as saídas já redigidas. */
export function rodarJava(opcoes: OpcoesDoJava): Promise<SaidaDoJava> {
  const inicio = Date.now()
  return new Promise((resolver, rejeitar) => {
    const processo = spawn(opcoes.javaBin, [...OPCOES_JVM, `@${opcoes.argfile}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    const limpar = (texto: string) => redigir(texto, opcoes.segredos)
    processo.stdout.setEncoding('utf8').on('data', (pedaco: string) => (stdout += pedaco))
    processo.stderr.setEncoding('utf8').on('data', (pedaco: string) => (stderr += pedaco))
    processo.on('error', (erro) => {
      const mensagem = `não deu para rodar o java em "${opcoes.javaBin}": ${erro.message}`
      rejeitar(new ErroJavaIndisponivel(mensagem, { causa: erro }))
    })
    processo.on('close', (codigo, sinal) => {
      const duracaoMs = Date.now() - inicio
      resolver({ codigo, sinal, stdout: limpar(stdout), stderr: limpar(stderr), duracaoMs })
    })
    if (processo.pid !== undefined) opcoes.aoIniciar?.(processo.pid)
  })
}
