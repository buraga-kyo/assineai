import { esquema as advocaciaHonorariosEsquema } from './minutas/advocacia-honorarios/esquema.js'
import metaAdvocaciaHonorarios from './minutas/advocacia-honorarios/meta.json' assert { type: 'json' }
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const minutas = {
  'advocacia-honorarios': {
    esquema: advocaciaHonorariosEsquema,
    meta: metaAdvocaciaHonorarios,
    lerModelo: () => readFileSync(join(__dirname, 'minutas/advocacia-honorarios/modelo.md'), 'utf-8')
  }
}
