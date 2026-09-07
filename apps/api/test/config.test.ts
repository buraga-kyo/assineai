import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { acharArquivoEnv, carregarConfig, ErroDeConfig } from '../src/config.js'

const completo: Record<string, string> = {
  BANCO_URL: 'postgres://assineai_app:app_dev@localhost:5432/assineai',
  REDIS_URL: 'redis://localhost:6379',
  ARMAZENAMENTO_ENDPOINT: 'http://localhost:9000',
  ARMAZENAMENTO_REGIAO: 'us-east-1',
  ARMAZENAMENTO_BUCKET: 'assineai',
  ARMAZENAMENTO_CHAVE: 'assineai',
  ARMAZENAMENTO_SEGREDO: 'assineai-dev-segredo',
}

describe('carregarConfig', () => {
  it('aceita o ambiente completo e aplica os padroes', () => {
    const config = carregarConfig(completo)
    expect(config.PORTA_API).toBe(3000)
    expect(config.LOG_NIVEL).toBe('info')
    expect(config.ARMAZENAMENTO_CAMINHO_FORCADO).toBe(true)
  })

  it('sem BANCO_URL rejeita dizendo qual variavel faltou', () => {
    const semBanco = { ...completo }
    delete semBanco.BANCO_URL
    expect(() => carregarConfig(semBanco)).toThrow(ErroDeConfig)
    expect(() => carregarConfig(semBanco)).toThrow('faltou a variavel BANCO_URL')
  })

  it('valor invalido aponta a variavel', () => {
    expect(() => carregarConfig({ ...completo, PORTA_API: 'abc' })).toThrow(
      'a variavel PORTA_API esta invalida',
    )
  })

  it('converte a porta e o caminho forcado', () => {
    const config = carregarConfig({
      ...completo,
      PORTA_API: '4000',
      ARMAZENAMENTO_CAMINHO_FORCADO: 'false',
    })
    expect(config.PORTA_API).toBe(4000)
    expect(config.ARMAZENAMENTO_CAMINHO_FORCADO).toBe(false)
  })
})

describe('acharArquivoEnv', () => {
  const pastas: string[] = []
  const pastaTemporaria = (nome: string) => {
    const pasta = mkdtempSync(join(tmpdir(), nome))
    pastas.push(pasta)
    return pasta
  }
  afterAll(() => pastas.forEach((pasta) => rmSync(pasta, { recursive: true, force: true })))

  it('sobe ate a raiz do monorepo e acha o .env de la', () => {
    const raiz = pastaTemporaria('assineai-raiz-')
    writeFileSync(join(raiz, 'pnpm-workspace.yaml'), '')
    writeFileSync(join(raiz, '.env'), '')
    const fundo = join(raiz, 'apps', 'api')
    mkdirSync(fundo, { recursive: true })
    expect(acharArquivoEnv(fundo)).toBe(join(raiz, '.env'))
  })

  it('sem pnpm-workspace.yaml acima, nao sai da pasta', () => {
    const solta = pastaTemporaria('assineai-solta-')
    writeFileSync(join(solta, '.env'), '')
    const fundo = join(solta, 'x', 'y')
    mkdirSync(fundo, { recursive: true })
    expect(acharArquivoEnv(fundo)).toBeUndefined()
    expect(acharArquivoEnv(solta)).toBe(join(solta, '.env'))
  })
})
