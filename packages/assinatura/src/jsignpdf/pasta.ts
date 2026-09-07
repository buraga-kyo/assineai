import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { montarArgfile } from './argfile.js'

export const PREFIXO_PASTA = 'assineai-selo-'

/** Cria a pasta temporária só do dono (0700), roda o trabalho e apaga a pasta sempre. */
export async function comPastaTemporaria<T>(trabalho: (pasta: string) => Promise<T>): Promise<T> {
  const pasta = await mkdtemp(join(tmpdir(), PREFIXO_PASTA))
  try {
    await chmod(pasta, 0o700)
    return await trabalho(pasta)
  } finally {
    await rm(pasta, { recursive: true, force: true })
  }
}

/** Grava um arquivo novo dentro da pasta, legível só pelo dono (0600). */
export async function gravarPrivado(
  pasta: string,
  nome: string,
  conteudo: Buffer | string,
): Promise<string> {
  const caminho = join(pasta, nome)
  await writeFile(caminho, conteudo, { mode: 0o600, flag: 'wx' })
  return caminho
}

/** Os argumentos do java vão para args.txt: é isso que mantém a senha fora do argv. */
export function gravarArgfile(pasta: string, argumentos: readonly string[]): Promise<string> {
  return gravarPrivado(pasta, 'args.txt', montarArgfile(argumentos))
}
