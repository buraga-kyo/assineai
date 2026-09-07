import { describe, expect, test } from 'vitest'
import { calcularVencimento } from '../src/index.js'

const DIA_MS = 86_400_000
const antes = (data: Date, dias: number) => new Date(data.getTime() - dias * DIA_MS)

describe('calcularVencimento', () => {
  const validoAte = new Date('2030-01-31T12:00:00Z')
  test('conta os dias inteiros e liga o alerta com 30 dias ou menos', () => {
    expect(calcularVencimento(validoAte, antes(validoAte, 100))).toEqual({
      diasParaVencer: 100,
      alerta30Dias: false,
    })
    expect(calcularVencimento(validoAte, antes(validoAte, 31))).toEqual({
      diasParaVencer: 31,
      alerta30Dias: false,
    })
    expect(calcularVencimento(validoAte, antes(validoAte, 30))).toEqual({
      diasParaVencer: 30,
      alerta30Dias: true,
    })
    expect(calcularVencimento(validoAte, antes(validoAte, 1.5))).toEqual({
      diasParaVencer: 1,
      alerta30Dias: true,
    })
  })
  test('certificado vencido fica negativo e com alerta', () => {
    expect(calcularVencimento(validoAte, antes(validoAte, -2))).toEqual({
      diasParaVencer: -2,
      alerta30Dias: true,
    })
  })
})
