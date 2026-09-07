import { describe, expect, test } from 'vitest'
import {
  ErroLinhaDeComandoJSignPdf,
  ErroNenhumaOperacaoJSignPdf,
  ErroSelagemJSignPdf,
  erroPorSaida,
  redigir,
  resumirStderr,
} from '../src/index.js'

describe('redigir', () => {
  test('troca a senha por [redigido] em todas as ocorrências', () => {
    expect(redigir('senha=abc123 e de novo abc123', 'abc123')).toBe(
      'senha=[redigido] e de novo [redigido]',
    )
  })
  test('aceita várias senhas e ignora vazia ou ausente', () => {
    expect(redigir('a=um b=dois', ['um', '', undefined, 'dois'])).toBe('a=[redigido] b=[redigido]')
    expect(redigir('nada a ver', '')).toBe('nada a ver')
  })
})

describe('erroPorSaida', () => {
  const stderr =
    "DETALHADO Default property file doesn't exists.\n" +
    'java.io.IOException: keystore password was incorrect\n\tat java.base/sun.security\n'
  test('segue a tabela de códigos do --help', () => {
    expect(erroPorSaida({ codigo: 1, sinal: null, stderr })).toBeInstanceOf(
      ErroLinhaDeComandoJSignPdf,
    )
    expect(erroPorSaida({ codigo: 2, sinal: null, stderr })).toBeInstanceOf(
      ErroNenhumaOperacaoJSignPdf,
    )
    expect(erroPorSaida({ codigo: 3, sinal: null, stderr })).toBeInstanceOf(ErroSelagemJSignPdf)
    expect(erroPorSaida({ codigo: 4, sinal: null, stderr })).toBeInstanceOf(ErroSelagemJSignPdf)
  })
  test('guarda código e stderr e resume a primeira linha que diz algo', () => {
    const erro = erroPorSaida({ codigo: 4, sinal: null, stderr })
    expect(erro.name).toBe('ErroSelagemJSignPdf')
    expect(erro.codigoDeSaida).toBe(4)
    expect(erro.stderr).toBe(stderr)
    expect(erro.message).toContain('keystore password was incorrect')
    expect(erro.message).not.toContain('DETALHADO')
    expect(resumirStderr('')).toBe('(sem detalhe no stderr)')
  })
  test('código fora da tabela ou morte por sinal vira erro de selagem com o motivo', () => {
    const porSinal = erroPorSaida({ codigo: null, sinal: 'SIGSEGV', stderr: '' })
    expect(porSinal).toBeInstanceOf(ErroSelagemJSignPdf)
    expect(porSinal.message).toContain('SIGSEGV')
    expect(erroPorSaida({ codigo: 137, sinal: null, stderr: '' }).message).toContain('137')
  })
})
