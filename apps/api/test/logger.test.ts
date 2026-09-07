import { describe, expect, it } from 'vitest'
import { capturarLog } from './apoio.js'

describe('criarLogger', () => {
  it('esconde cookie, authorization e campos secretos ate dois niveis', () => {
    const { logger, texto } = capturarLog()
    const headers = {
      cookie: 'sessao=COOKIE1',
      authorization: 'Bearer TOKEN1',
      'user-agent': 'curl',
    }
    logger.info({ req: { headers } }, 'requisicao')
    logger.info(
      {
        senha: 'RAIZ1',
        body: { codigo: 'COD1', dados: { token: 'TOK1', credenciais: 'CRED1' } },
        conta: { credenciais_cifradas: 'CIF1' },
      },
      'campos',
    )
    const saida = texto()
    for (const segredo of ['COOKIE1', 'TOKEN1', 'RAIZ1', 'COD1', 'TOK1', 'CRED1', 'CIF1']) {
      expect(saida).not.toContain(segredo)
    }
    expect(saida).toContain('[oculto]')
    expect(saida).toContain('curl')
  })

  it('nao escreve abaixo do nivel', () => {
    const { logger, linhas } = capturarLog()
    logger.debug('detalhe')
    expect(linhas).toHaveLength(0)
  })
})
