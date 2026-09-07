import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { ErroSelagemJSignPdf, PREFIXO_PASTA, selarPdf } from '../src/index.js'
import { certificadoDeTeste, jar, temCertificado } from './apoio/config.js'
import { contarMarca, gerarPdf } from './apoio/pdf.js'
import { capturarLinhaDeComando, type Captura } from './apoio/processo.js'

const certificado = certificadoDeTeste ?? { arquivo: '', senha: '' }
const base = { certificado, razao: 'Teste', local: 'Sao Paulo', contato: 'contato@exemplo.com' }

describe.skipIf(!temCertificado)('selarPdf com o certificado de teste', () => {
  test('sela o PDF, devolve o arquivo maior e apaga a pasta temporária', async () => {
    const entrada = await gerarPdf()
    let captura: Captura | undefined
    const aoIniciar = (pid: number) => (captura = capturarLinhaDeComando(pid))
    const { saida, duracaoMs } = await selarPdf({ ...base, entrada }, { jar, aoIniciar })
    expect(saida.length).toBeGreaterThan(entrada.length)
    expect(contarMarca(saida, '/ByteRange')).toBe(1)
    expect(contarMarca(saida, '/adbe.pkcs7.detached')).toBe(1)
    expect(duracaoMs).toBeGreaterThan(0)
    expect(captura?.pasta).toContain(PREFIXO_PASTA)
    expect(existsSync(captura?.pasta ?? '')).toBe(false)
  })
  test('a lista de processos vê só java ... @args.txt, nunca a senha', async () => {
    let captura: Captura | undefined
    const aoIniciar = (pid: number) => (captura = capturarLinhaDeComando(pid))
    await selarPdf({ ...base, entrada: await gerarPdf() }, { jar, aoIniciar })
    const argv = captura?.argv ?? []
    expect(argv).toHaveLength(4)
    expect(argv.slice(0, 3)).toEqual(['java', '-Xmx256m', '-Djava.awt.headless=true'])
    expect(argv[3]?.startsWith(`@${join(tmpdir(), PREFIXO_PASTA)}`)).toBe(true)
    expect(argv[3]?.endsWith('/args.txt')).toBe(true)
    expect(argv.join(' ')).not.toContain(certificado.senha)
  })
})
