import { esquema as advocaciaHonorariosEsquema } from './minutas/advocacia-honorarios/esquema.js'
import metaAdvocaciaHonorarios from './minutas/advocacia-honorarios/meta.json' with { type: 'json' }

import { esquema as musicaSplitSheetEsquema } from './minutas/musica-split-sheet/esquema.js'
import metaMusicaSplitSheet from './minutas/musica-split-sheet/meta.json' with { type: 'json' }

import { esquema as musicaContratoShowEsquema } from './minutas/musica-contrato-show/esquema.js'
import metaMusicaContratoShow from './minutas/musica-contrato-show/meta.json' with { type: 'json' }

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
  },
  'musica-split-sheet': {
    esquema: musicaSplitSheetEsquema,
    meta: metaMusicaSplitSheet,
    lerModelo: () => readFileSync(join(__dirname, 'minutas/musica-split-sheet/modelo.md'), 'utf-8')
  },
  'musica-contrato-show': {
    esquema: musicaContratoShowEsquema,
    meta: metaMusicaContratoShow,
    lerModelo: () => readFileSync(join(__dirname, 'minutas/musica-contrato-show/modelo.md'), 'utf-8')
  }
}
