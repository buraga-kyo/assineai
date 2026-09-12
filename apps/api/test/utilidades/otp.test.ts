import { describe, it, expect } from 'vitest'
import { gerarCodigoEmClaro, gerarHmacOtp, validarOtp, type DadosOtp } from '../../src/utilidades/otp.js'

describe('Utilidades OTP', () => {
  const CHAVE_OTP = 'pimenta_muito_segura_para_teste_123'

  it('deve gerar código numérico de 6 dígitos', () => {
    const codigo = gerarCodigoEmClaro()
    expect(codigo).toMatch(/^\d{6}$/)
  })

  it('deve gerar hashes idênticos para o mesmo código e chave', () => {
    const codigo = '123456'
    const hash1 = gerarHmacOtp(codigo, CHAVE_OTP)
    const hash2 = gerarHmacOtp(codigo, CHAVE_OTP)
    expect(hash1).toBe(hash2)
  })

  it('deve gerar hashes diferentes para códigos ou chaves diferentes', () => {
    const codigo1 = '123456'
    const codigo2 = '654321'
    const hash1 = gerarHmacOtp(codigo1, CHAVE_OTP)
    const hash2 = gerarHmacOtp(codigo2, CHAVE_OTP)
    const hash3 = gerarHmacOtp(codigo1, 'outra_chave')

    expect(hash1).not.toBe(hash2)
    expect(hash1).not.toBe(hash3)
  })

  describe('Validação', () => {
    const MAX_TENTATIVAS = 5
    const AGORA = new Date('2026-09-12T10:00:00Z')
    const FUTURO = new Date('2026-09-12T10:10:00Z')
    const PASSADO = new Date('2026-09-12T09:50:00Z')
    const codigoValido = '555555'
    const hashValido = gerarHmacOtp(codigoValido, CHAVE_OTP)

    const criarDados = (modificacoes: Partial<DadosOtp> = {}): DadosOtp => ({
      hash: hashValido,
      expiraEm: FUTURO,
      tentativas: 0,
      bloqueado: false,
      ...modificacoes,
    })

    it('deve aprovar um código correto', () => {
      const dados = criarDados()
      const resultado = validarOtp(codigoValido, CHAVE_OTP, dados, MAX_TENTATIVAS, AGORA)
      expect(resultado).toEqual({ sucesso: true })
    })

    it('deve recursar e decrementar tentativas em código incorreto', () => {
      const dados = criarDados({ tentativas: 2 })
      const resultado = validarOtp('000000', CHAVE_OTP, dados, MAX_TENTATIVAS, AGORA)
      expect(resultado).toEqual({ sucesso: false, motivo: 'invalido', tentativasRestantes: 2 })
    })

    it('deve bloquear após exceder maxTentativas', () => {
      const dados = criarDados({ tentativas: 4 })
      const resultado = validarOtp('000000', CHAVE_OTP, dados, MAX_TENTATIVAS, AGORA)
      expect(resultado).toEqual({ sucesso: false, motivo: 'bloqueado', tentativasRestantes: 0 })
    })

    it('deve recusar se já estiver bloqueado', () => {
      const dados = criarDados({ bloqueado: true })
      // Mesmo com código correto, se está bloqueado, falha
      const resultado = validarOtp(codigoValido, CHAVE_OTP, dados, MAX_TENTATIVAS, AGORA)
      expect(resultado).toEqual({ sucesso: false, motivo: 'bloqueado' })
    })

    it('deve recusar se estiver expirado', () => {
      const dados = criarDados({ expiraEm: PASSADO })
      const resultado = validarOtp(codigoValido, CHAVE_OTP, dados, MAX_TENTATIVAS, AGORA)
      expect(resultado).toEqual({ sucesso: false, motivo: 'expirado' })
    })
  })
})
