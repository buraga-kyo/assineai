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
})
