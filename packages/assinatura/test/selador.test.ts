import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { criarSelador } from '../src/index.js'
import { jar } from './apoio/config.js'

// O "java" aqui é um script que dorme 300 ms e sai com 4: basta para medir quantos rodam juntos.
const pedido = {
  entrada: Buffer.from('%PDF-1.4\n'),
  certificado: { arquivo: '/nao/importa.pfx', senha: 'x' },
  razao: '',
  local: '',
  contato: '',
}
let pasta: string
let javaFalso: string

beforeAll(async () => {
  pasta = await mkdtemp(join(tmpdir(), 'assinatura-teste-'))
  javaFalso = join(pasta, 'java-falso')
  await writeFile(javaFalso, '#!/bin/sh\nsleep 0.3\nexit 4\n')
  await chmod(javaFalso, 0o755)
})
afterAll(() => rm(pasta, { recursive: true, force: true }))

test('criarSelador não deixa passar de ambiente.concorrencia javas ao mesmo tempo', async () => {
  let rodando = 0
  let pico = 0
  const aoIniciar = () => {
    rodando += 1
    pico = Math.max(pico, rodando)
  }
  const selador = criarSelador({ jar, javaBin: javaFalso, concorrencia: 2, aoIniciar })
  const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))
  const pedidos = [1, 2, 3, 4].map(() => selador.selar(pedido).catch(() => (rodando -= 1)))
  await espera(100)
  expect(selador.ativas).toBe(2)
  expect(selador.naFila).toBe(2)
  await Promise.all(pedidos)
  expect(pico).toBe(2)
  expect(selador.ativas).toBe(0)
})
