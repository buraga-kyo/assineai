// Unico lugar que le process.env. Valida tudo no boot: variavel faltando ou
// invalida derruba o processo com uma mensagem que diz qual foi.
import { existsSync } from 'node:fs'
import { z } from 'zod'

const esquema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORTA_API: z.coerce.number().int().positive().default(3000),
  LOG_NIVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  BANCO_URL: z.url(),
  REDIS_URL: z.url(),
  ARMAZENAMENTO_ENDPOINT: z.url(),
  ARMAZENAMENTO_REGIAO: z.string().min(1),
  ARMAZENAMENTO_BUCKET: z.string().min(1),
  ARMAZENAMENTO_CHAVE: z.string().min(1),
  ARMAZENAMENTO_SEGREDO: z.string().min(1),
  ARMAZENAMENTO_CAMINHO_FORCADO: z.stringbool().default(true),
})

export type Config = z.infer<typeof esquema>

export class ErroDeConfig extends Error {
  constructor(readonly problemas: string[]) {
    super(problemas.join('\n'))
    this.name = 'ErroDeConfig'
  }
}

export function carregarConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const resultado = esquema.safeParse(env)
  if (resultado.success) return resultado.data
  const problemas = resultado.error.issues.map((problema) => {
    const nome = String(problema.path[0])
    return env[nome] === undefined
      ? `faltou a variavel ${nome}`
      : `a variavel ${nome} esta invalida: ${problema.message}`
  })
  throw new ErroDeConfig(problemas)
}

// Para os pontos de entrada: le o .env da pasta atual (o ambiente real ganha
// do arquivo), valida e sai com codigo 1 se algo faltar.
export function carregarConfigOuSair(): Config {
  if (existsSync('.env')) process.loadEnvFile('.env')
  try {
    return carregarConfig()
  } catch (erro) {
    if (!(erro instanceof ErroDeConfig)) throw erro
    process.stderr.write(`a api nao subiu, a configuracao esta incompleta:\n${erro.message}\n`)
    process.stderr.write('confira o .env (modelo em .env.example)\n')
    process.exit(1)
  }
}
