import { existsSync } from 'node:fs'
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { ErroJavaIndisponivel, ErroTimeoutJSignPdf, selarPdf } from '../src/index.js'
import { jar } from './apoio/config.js'
import { capturarLinhaDeComando, type Captura } from './apoio/processo.js'

// Nada aqui precisa de java nem de certificado: o "java" é um script que dorme, ou não existe.
const pedido = {
  entrada: Buffer.from('%PDF-1.4\n'),
  certificado: { arquivo: '/nao/importa.pfx', senha: 'x' },
  razao: '',
  local: '',
  contato: '',
}
let pasta: string
let javaLento: string

beforeAll(async () => {
  pasta = await mkdtemp(join(tmpdir(), 'assinatura-teste-'))
  javaLento = join(pasta, 'java-lento')
  await writeFile(javaLento, '#!/bin/sh\nsleep 30\n')
  await chmod(javaLento, 0o755)
})
afterAll(() => rm(pasta, { recursive: true, force: true }))

describe('selarPdf sem java de verdade', () => {
  test('java que dorme estoura o timeout, leva SIGKILL e a pasta some', async () => {
    let captura: Captura | undefined
    const aoIniciar = (pid: number) => (captura = capturarLinhaDeComando(pid))
    const inicio = Date.now()
    const ambiente = { jar, javaBin: javaLento, aoIniciar }
    const erro = await selarPdf({ ...pedido, timeoutMs: 500 }, ambiente).catch((e: unknown) => e)
    expect(Date.now() - inicio).toBeLessThan(2000)
    expect(erro).toBeInstanceOf(ErroTimeoutJSignPdf)
    expect((erro as Error).message).toContain('500 ms')
    expect(captura?.pasta).toBeDefined()
    expect(existsSync(captura?.pasta ?? '')).toBe(false)
  })
  test('java inexistente vira ErroJavaIndisponivel', async () => {
    const erro = await selarPdf(pedido, { jar, javaBin: '/nao/existe/java' }).catch(
      (e: unknown) => e,
    )
    expect(erro).toBeInstanceOf(ErroJavaIndisponivel)
    expect((erro as Error).message).toContain('/nao/existe/java')
  })
})
