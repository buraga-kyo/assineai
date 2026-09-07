import { describe, expect, test } from 'vitest'
import { montarArgumentosDeSelagem, type PedidoDeSelagem } from '../src/index.js'

const pedido: PedidoDeSelagem = {
  entrada: Buffer.from('%PDF'),
  certificado: { arquivo: '/certs/plataforma.pfx', senha: 's3nh@ com espaço' },
  razao: 'Assinatura da plataforma',
  local: 'São Paulo',
  contato: 'contato@exemplo.com',
}
const caminhos = { jar: '/opt/JSignPdf.jar', pasta: '/tmp/x', entrada: '/tmp/x/entrada.pdf' }
const depoisDe = (args: string[], opcao: string) => args[args.indexOf(opcao) + 1]

describe('montarArgumentosDeSelagem', () => {
  test('usa SHA256, certifica por padrão e termina no PDF', () => {
    const args = montarArgumentosDeSelagem(pedido, caminhos)
    expect(args.slice(0, 2)).toEqual(['-jar', '/opt/JSignPdf.jar'])
    expect(depoisDe(args, '-kst')).toBe('PKCS12')
    expect(depoisDe(args, '-ksf')).toBe('/certs/plataforma.pfx')
    expect(depoisDe(args, '-ksp')).toBe('s3nh@ com espaço')
    expect(depoisDe(args, '-ha')).toBe('SHA256')
    expect(depoisDe(args, '-cl')).toBe('CERTIFIED_NO_CHANGES_ALLOWED')
    expect(depoisDe(args, '-r')).toBe('Assinatura da plataforma')
    expect(depoisDe(args, '-d')).toBe('/tmp/x')
    expect(depoisDe(args, '-os')).toBe('_selado')
    expect(args).toContain('-q')
    expect(args).not.toContain('-a')
    expect(args).not.toContain('-ka')
    expect(args.at(-1)).toBe('/tmp/x/entrada.pdf')
  })
  test('razão, local e contato vazios ficam de fora', () => {
    const args = montarArgumentosDeSelagem(
      { ...pedido, razao: '', local: '', contato: '' },
      caminhos,
    )
    expect(args).not.toContain('-r')
    expect(args).not.toContain('-l')
    expect(args).not.toContain('-c')
  })
  test('anexar, nível, alias e tsa entram quando pedidos', () => {
    const certificado = { ...pedido.certificado, alias: 'assineai' }
    const tsa = { url: 'http://tsa.exemplo', usuario: 'u', senha: 'p' }
    const args = montarArgumentosDeSelagem(
      { ...pedido, certificado, anexar: true, nivel: 'NOT_CERTIFIED', tsa },
      caminhos,
    )
    expect(args).toContain('-a')
    expect(depoisDe(args, '-cl')).toBe('NOT_CERTIFIED')
    expect(depoisDe(args, '-ka')).toBe('assineai')
    expect(depoisDe(args, '-ts')).toBe('http://tsa.exemplo')
    expect(depoisDe(args, '-tsh')).toBe('SHA256')
    expect(depoisDe(args, '-ta')).toBe('PASSWORD')
    expect(depoisDe(args, '-tsu')).toBe('u')
    expect(depoisDe(args, '-tsp')).toBe('p')
  })
  test('tsa sem usuário vai sem autenticação', () => {
    const args = montarArgumentosDeSelagem(
      { ...pedido, tsa: { url: 'http://tsa.exemplo' } },
      caminhos,
    )
    expect(args).toContain('-ts')
    expect(args).not.toContain('-ta')
  })
  test('assinatura visível leva página, posição e a imagem com o modo gráfico', () => {
    const visivel = { pagina: 2, llx: 10, lly: 20, urx: 110, ury: 60, imagem: '/img.png' }
    const args = montarArgumentosDeSelagem({ ...pedido, visivel }, caminhos)
    expect(args).toContain('-V')
    expect(depoisDe(args, '-pg')).toBe('2')
    expect([depoisDe(args, '-llx'), depoisDe(args, '-lly')]).toEqual(['10', '20'])
    expect([depoisDe(args, '-urx'), depoisDe(args, '-ury')]).toEqual(['110', '60'])
    expect(depoisDe(args, '--img-path')).toBe('/img.png')
    expect(depoisDe(args, '--render-mode')).toBe('GRAPHIC_AND_DESCRIPTION')
  })
})
