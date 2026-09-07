import { describe, expect, test } from 'vitest'
import { escaparArgumento, montarArgfile } from '../src/index.js'

describe('escaparArgumento', () => {
  test('põe aspas duplas em tudo, com ou sem espaço', () => {
    expect(escaparArgumento('simples')).toBe('"simples"')
    expect(escaparArgumento('com espaço')).toBe('"com espaço"')
    expect(escaparArgumento('')).toBe('""')
  })
  test('escapa barra, aspas, quebra de linha e tab', () => {
    expect(escaparArgumento('a"b\\c')).toBe('"a\\"b\\\\c"')
    expect(escaparArgumento('linha\nquebrada\tcom tab')).toBe('"linha\\nquebrada\\tcom tab"')
  })
  test('deixa # e acento como estão (dentro das aspas o java não trata)', () => {
    expect(escaparArgumento('cor #ff0 açaí')).toBe('"cor #ff0 açaí"')
  })
})

describe('montarArgfile', () => {
  test('um argumento por linha, com quebra no fim', () => {
    const argfile = montarArgfile(['-jar', '/pasta com espaço/x.jar', '-ksp', 's3nh@ "x"'])
    expect(argfile).toBe('"-jar"\n"/pasta com espaço/x.jar"\n"-ksp"\n"s3nh@ \\"x\\""\n')
  })
})
