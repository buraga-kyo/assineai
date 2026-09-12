import { test, expect, vi } from 'vitest'
import { driverOts } from '../../src/servicos/opentimestamps.js'

// Faz o mock do node:child_process para não precisar do Python+ots localmente no teste
vi.mock('node:child_process', () => {
  return {
    execFile: (comando: string, args: string[], opts: any, callback: any) => {
      // Simula ots stamp -d
      if (args[0] === 'stamp' && args[1] === '-d') {
        const fs = require('fs')
        const path = require('path')
        const hash = args[2]
        const filePath = path.join(opts.cwd, `${hash}.ots`)
        fs.writeFileSync(filePath, Buffer.from('mock-ots-data'))
        
        if (typeof opts === 'function') opts(null, { stdout: '' })
        else callback(null, { stdout: '' })
        return
      }
      
      // Simula ots upgrade
      if (args[0] === 'upgrade') {
        if (typeof opts === 'function') opts(null, { stdout: '' })
        else callback(null, { stdout: '' })
        return
      }

      // Simula ots info
      if (args[0] === 'info') {
        const stdout = 'Bitcoin block 800000 at timestamp 2026-09-12'
        if (typeof opts === 'function') opts(null, { stdout })
        else callback(null, { stdout })
        return
      }
    }
  }
})

test('carimbar gera um buffer (mockado)', async () => {
  const hashMock = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
  const bufferOts = await driverOts.carimbar(hashMock)
  
  expect(bufferOts).toBeInstanceOf(Buffer)
  expect(bufferOts.toString()).toBe('mock-ots-data')
})

test('info detecta bloco a partir do stdout', async () => {
  const bufferMock = Buffer.from('algum dado ots')
  const info = await driverOts.info(bufferMock)
  
  expect(info.ancorado).toBe(true)
  expect(info.numeroBloco).toBe(800000)
})
