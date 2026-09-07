import { existsSync } from 'node:fs'
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import {
  ErroJavaIndisponivel,
  ErroSelagemJSignPdf,
  ErroTimeoutJSignPdf,
  selarPdf,
} from '../src/index.js'
import { ehLinux, jar } from './apoio/config.js'
import { capturarLinhaDeComando, type Captura } from './apoio/processo.js'

// Nada aqui precisa de java nem de certificado: o "java" é um script que dorme, ou não existe.
const pedido = {
  entrada: Buffer.from('%PDF-1.4\n'),
  certificado: { arquivo: '/nao/importa.pfx', senha: 'x' },
  razao: '',
  local: '',
  contato: '',
}
const testeLinux = test.skipIf(!ehLinux)
let pasta: string
let javaLento: string
let javaComNeto: string
let javaQueFalha: string

async function script(nome: string, corpo: string): Promise<string> {
  const caminho = join(pasta, nome)
  await writeFile(caminho, `#!/bin/sh\n${corpo}`)
  await chmod(caminho, 0o755)
  return caminho
}

beforeAll(async () => {
  pasta = await mkdtemp(join(tmpdir(), 'assinatura-teste-'))
  javaLento = await script('java-lento', 'sleep 30\n')
  // sai na hora, mas deixa um filho segurando o stdout: o close só viria dali a 30 s
  javaComNeto = await script('java-com-neto', 'sleep 30 &\nexit 0\n')
  javaQueFalha = await script('java-que-falha', 'exit 4\n')
})
afterAll(() => rm(pasta, { recursive: true, force: true }))

async function selarComTimeout(javaBin: string) {
  let captura: Captura | undefined
  const aoIniciar = (pid: number) => (captura = capturarLinhaDeComando(pid))
  const inicio = Date.now()
  const erro = await selarPdf({ ...pedido, timeoutMs: 500 }, { jar, javaBin, aoIniciar }).catch(
    (e: unknown) => e,
  )
  return { erro, levou: Date.now() - inicio, pasta: captura?.pasta }
}

describe('selarPdf sem java de verdade', () => {
  testeLinux('java que dorme estoura o timeout, leva SIGKILL e a pasta some', async () => {
    const { erro, levou, pasta } = await selarComTimeout(javaLento)
    expect(levou).toBeLessThan(2000)
    expect(erro).toBeInstanceOf(ErroTimeoutJSignPdf)
    expect((erro as Error).message).toContain('500 ms')
    expect(pasta).toBeDefined()
    expect(existsSync(pasta ?? '')).toBe(false)
  })
  testeLinux('neto segurando o stdout não trava o timeout nem deixa a pasta', async () => {
    const { erro, levou, pasta } = await selarComTimeout(javaComNeto)
    expect(levou).toBeLessThan(2000)
    expect(erro).toBeInstanceOf(ErroTimeoutJSignPdf)
    expect(existsSync(pasta ?? '')).toBe(false)
  })
  test('aoIniciar que lança não derruba a selagem', async () => {
    const aoIniciar = () => {
      throw new Error('callback quebrado')
    }
    const ambiente = { jar, javaBin: javaQueFalha, aoIniciar }
    const erro = await selarPdf(pedido, ambiente).catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ErroSelagemJSignPdf)
    expect((erro as Error).message).not.toContain('callback quebrado')
  })
  test('java inexistente vira ErroJavaIndisponivel', async () => {
    const erro = await selarPdf(pedido, { jar, javaBin: '/nao/existe/java' }).catch(
      (e: unknown) => e,
    )
    expect(erro).toBeInstanceOf(ErroJavaIndisponivel)
    expect((erro as Error).message).toContain('/nao/existe/java')
  })
})
