import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, readFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'

const executar = promisify(execFile)

export interface InfoAncoragem {
  ancorado: boolean
  numeroBloco?: number | undefined
  horaBloco?: Date | undefined
}

export interface AncoraDeTempo {
  carimbar(hashPuroBase64OuHex: string): Promise<Buffer>
  atualizar(provaOtsBuffer: Buffer): Promise<Buffer>
  info(provaOtsBuffer: Buffer): Promise<InfoAncoragem>
}

export const driverOts: AncoraDeTempo = {
  async carimbar(hashPuroHex: string) {
    const tmpFile = join(tmpdir(), `ots-${randomUUID()}.txt`)
    // O ots stamp precisa de um arquivo. Vamos gravar o hash num arquivo de mentira?
    // Na verdade, opentimestamps aceita arquivo, ele fará o sha256 do arquivo.
    // Mas nós já temos o hashFinal (que é um SHA-256 do arquivo final real).
    // O ots stamp aceita a flag -d para receber o digest (hash) direto no lugar de um arquivo!
    
    // ots stamp -d <hash_hex>
    // Ele gera um <hash_hex>.ots no diretório atual. Pra controlar isso melhor,
    // rodamos num dir temporario
    const workDir = tmpdir()
    
    try {
      await executar('ots', ['stamp', '-d', hashPuroHex], { cwd: workDir })
      const otsPath = join(workDir, `${hashPuroHex}.ots`)
      const buffer = await readFile(otsPath)
      await unlink(otsPath).catch(() => {})
      return buffer
    } catch (e: any) {
      throw new Error(`Falha ao ancorar no OTS: ${e.message}`)
    }
  },

  async atualizar(provaOtsBuffer: Buffer) {
    const otsPath = join(tmpdir(), `upg-${randomUUID()}.ots`)
    await writeFile(otsPath, provaOtsBuffer)
    
    try {
      // ots upgrade <arquivo.ots> sobrescreve o proprio arquivo
      await executar('ots', ['upgrade', otsPath])
      const atualizado = await readFile(otsPath)
      await unlink(otsPath).catch(() => {})
      return atualizado
    } catch (e: any) {
      await unlink(otsPath).catch(() => {})
      throw new Error(`Falha ao atualizar OTS: ${e.message}`)
    }
  },

  async info(provaOtsBuffer: Buffer) {
    const otsPath = join(tmpdir(), `info-${randomUUID()}.ots`)
    await writeFile(otsPath, provaOtsBuffer)
    
    try {
      // ots info <arquivo.ots> devolve texto
      const { stdout } = await executar('ots', ['info', otsPath])
      await unlink(otsPath).catch(() => {})
      
      // O ots info imprime "Bitcoin block NNN at timestamp..." se tiver ancorado
      const blocoMatch = stdout.match(/Bitcoin block (\d+)/)
      
      return {
        ancorado: !!blocoMatch,
        numeroBloco: blocoMatch ? parseInt(blocoMatch[1] as string, 10) : undefined
      }
    } catch (e: any) {
      await unlink(otsPath).catch(() => {})
      throw new Error(`Falha ao ler OTS: ${e.message}`)
    }
  }
}
