import { describe, expect, test } from 'vitest'
import { ErroCertificado, calcularVencimento, verificarCertificado } from '../src/index.js'
import { certificadoDeTeste, jar, temCertificado } from './apoio/config.js'

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

describe.skipIf(!temCertificado)('verificarCertificado com o certificado de teste', () => {
  const certificado = certificadoDeTeste ?? { arquivo: '', senha: '' }
  test('devolve titular, validade, alerta coerente e os aliases do jsignpdf', async () => {
    const dados = await verificarCertificado({ ...certificado, jar })
    expect(dados.titular).not.toBe('')
    expect(dados.emissor).not.toBe('')
    expect(dados.numeroSerie).toMatch(/^[0-9a-f]+$/i)
    expect(dados.validoAte.getTime()).toBeGreaterThan(dados.validoDe.getTime())
    expect(dados.alerta30Dias).toBe(dados.diasParaVencer <= 30)
    expect(dados.aliases.length).toBeGreaterThan(0)
  })
  test('perto do vencimento o alerta liga', async () => {
    const { validoAte } = await verificarCertificado({ ...certificado, jar })
    const perto = await verificarCertificado({ ...certificado, jar, agora: antes(validoAte, 10) })
    expect(perto).toMatchObject({ diasParaVencer: 10, alerta30Dias: true })
  })
  test('senha errada e alias inexistente viram ErroCertificado sem vazar a senha', async () => {
    const senhaErrada = 'senha-errada-7f2a'
    const opcoes = { ...certificado, senha: senhaErrada, jar }
    const erro = await verificarCertificado(opcoes).catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ErroCertificado)
    expect((erro as Error).message).not.toContain(senhaErrada)
    const alias = await verificarCertificado({ ...certificado, alias: 'nao-existe', jar }).catch(
      (e: unknown) => e,
    )
    expect(alias).toBeInstanceOf(ErroCertificado)
    expect((alias as Error).message).toContain('nao-existe')
  })
})
