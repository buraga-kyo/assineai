import { spawn, type ChildProcess } from 'node:child_process'
import { ErroJavaIndisponivel, ErroTimeoutJSignPdf, redigir } from './erros.js'

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
    // detached: o java vira líder de grupo, e o timeout mata o grupo inteiro, filhos incluídos.
    const processo = spawn(opcoes.javaBin, [...OPCOES_JVM, `@${opcoes.argfile}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    })
    let stdout = ''
    let stderr = ''
    let encerrado = false
    let estourou = false
    const limpar = (texto: string) => redigir(texto, opcoes.segredos)
    const relogio = setTimeout(() => {
      estourou = true
      matarGrupo(processo)
    }, opcoes.timeoutMs)
    // Resolve ou rejeita uma vez só: error e close podem chegar os dois (java que não existe).
    const encerrar = (fim: () => void) => {
      if (encerrado) return
      encerrado = true
      clearTimeout(relogio)
      fim()
    }
    processo.stdout.setEncoding('utf8').on('data', (pedaco: string) => (stdout += pedaco))
    processo.stderr.setEncoding('utf8').on('data', (pedaco: string) => (stderr += pedaco))
    processo.on('error', (erro) => {
      const mensagem = `não deu para rodar o java em "${opcoes.javaBin}": ${erro.message}`
      encerrar(() => rejeitar(new ErroJavaIndisponivel(mensagem, { causa: erro })))
    })
    // No timeout a resposta sai no exit, sem esperar o close: um órfão segurando o pipe travaria tudo.
    processo.on('exit', () => {
      if (!estourou) return
      const mensagem = `o JSignPdf passou de ${opcoes.timeoutMs} ms e foi morto com SIGKILL`
      encerrar(() => rejeitar(new ErroTimeoutJSignPdf(mensagem, { stderr: limpar(stderr) })))
    })
    processo.on('close', (codigo, sinal) => {
      const duracaoMs = Date.now() - inicio
      const saida = { codigo, sinal, stdout: limpar(stdout), stderr: limpar(stderr), duracaoMs }
      encerrar(() => resolver(saida))
    })
    if (processo.pid !== undefined) opcoes.aoIniciar?.(processo.pid)
  })
}

/** SIGKILL no grupo de processos do java; se o grupo já se foi, tenta o processo sozinho. */
function matarGrupo(processo: ChildProcess): void {
  try {
    if (processo.pid === undefined) throw new Error('sem pid')
    process.kill(-processo.pid, 'SIGKILL')
  } catch {
    processo.kill('SIGKILL')
  }
}
