// Unico lugar que le process.env. Valida tudo no boot: variavel faltando ou
// invalida derruba o processo com uma mensagem que diz qual foi.
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { z } from 'zod'

const esquema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORTA_API: z.coerce.number().int().positive().default(3000),
  LOG_NIVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  BANCO_URL: z.url(),
  // opcional na api: so o script de migracao precisa dela (ver esquemaMigracao)
  BANCO_URL_MIGRACAO: z.url().optional(),
  REDIS_URL: z.url(),
  ARMAZENAMENTO_ENDPOINT: z.url(),
  ARMAZENAMENTO_REGIAO: z.string().min(1),
  ARMAZENAMENTO_BUCKET: z.string().min(1),
  ARMAZENAMENTO_CHAVE: z.string().min(1),
  ARMAZENAMENTO_SEGREDO: z.string().min(1),
  ARMAZENAMENTO_CAMINHO_FORCADO: z.coerce.boolean().default(true),
  ARMAZENAMENTO_LIMITE_TAMANHO: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  SMTP_URL: z.string().url().optional(),
  EMAIL_REMETENTE: z.string().optional(),
  CHAVE_OTP: z.string().min(16),
  OTP_VALIDADE_MIN: z.coerce.number().int().positive().default(10),
  OTP_TENTATIVAS: z.coerce.number().int().positive().default(5),
  CORS_ORIGENS: z.string().min(1),
})

export type Config = z.infer<typeof esquema>

// O que o script de migracao (e o drizzle-kit) precisa: so a URL da role dona
// e o basico do logger. O container de migracao nao recebe redis nem storage.
const esquemaMigracao = esquema.pick({ NODE_ENV: true, LOG_NIVEL: true }).extend({
  BANCO_URL_MIGRACAO: z.url(),
})

export type ConfigDeMigracao = z.infer<typeof esquemaMigracao>

export class ErroDeConfig extends Error {
  constructor(readonly problemas: string[]) {
    super(problemas.join('\n'))
    this.name = 'ErroDeConfig'
  }
}

export function carregarConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return validar(esquema, env)
}

export function carregarConfigDeMigracao(env: NodeJS.ProcessEnv = process.env): ConfigDeMigracao {
  return validar(esquemaMigracao, env)
}

function validar<T>(esquema: z.ZodType<T>, env: NodeJS.ProcessEnv): T {
  const resultado = esquema.safeParse(env)
  if (resultado.success) return resultado.data
  const problemas = resultado.error.issues.map((problema) => {
    const nome = problema.path[0]
    if (typeof nome !== 'string') return `o ambiente esta invalido: ${problema.message}`
    return env[nome] === undefined
      ? `faltou a variavel ${nome}`
      : `a variavel ${nome} esta invalida: ${problema.message}`
  })
  throw new ErroDeConfig(problemas)
}

// Procura o .env a partir de `inicio` subindo ate a raiz do monorepo (a pasta
// com pnpm-workspace.yaml, inclusive), porque o README manda copiar o modelo
// para a raiz e o `pnpm dev` roda com cwd em apps/api. Sem essa raiz acima
// (dist em producao, por exemplo), so olha a propria pasta.
export function acharArquivoEnv(inicio = process.cwd()): string | undefined {
  const pastas = [inicio]
  let pasta = inicio
  while (!existsSync(join(pasta, 'pnpm-workspace.yaml'))) {
    const acima = dirname(pasta)
    if (acima === pasta) return existsSync(join(inicio, '.env')) ? join(inicio, '.env') : undefined
    pasta = acima
    pastas.push(pasta)
  }
  return pastas.map((p) => join(p, '.env')).find((arquivo) => existsSync(arquivo))
}

// So o ambiente, sem exigir o resto: para scripts que decidem se podem rodar
// antes de pedir qualquer credencial (db:push).
export function emProducao(): boolean {
  const arquivo = acharArquivoEnv()
  if (arquivo) process.loadEnvFile(arquivo)
  return process.env.NODE_ENV === 'production'
}

// Para os pontos de entrada: carrega o .env se houver (o ambiente real ganha
// do arquivo), valida e sai com codigo 1 se algo faltar.
export function carregarConfigOuSair(): Config {
  return carregarOuSair(carregarConfig, 'a api nao subiu')
}

export function carregarConfigDeMigracaoOuSair(): ConfigDeMigracao {
  return carregarOuSair(carregarConfigDeMigracao, 'a migracao nao rodou')
}

function carregarOuSair<T>(carregar: (env: NodeJS.ProcessEnv) => T, quem: string): T {
  const arquivo = acharArquivoEnv()
  if (arquivo) process.loadEnvFile(arquivo)
  try {
    return carregar(process.env)
  } catch (erro) {
    if (!(erro instanceof ErroDeConfig)) throw erro
    process.stderr.write(`${quem}, a configuracao esta incompleta:\n${erro.message}\n`)
    process.stderr.write('confira o .env na raiz do repositorio (modelo em .env.example)\n')
    process.exit(1)
  }
}
