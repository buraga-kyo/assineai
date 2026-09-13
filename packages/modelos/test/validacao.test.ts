import { test, expect } from 'vitest'
import { minutas } from '../src/index.js'
import Mustache from 'mustache'

test('todas as chaves do modelo.md estao no esquema zod', () => {
  for (const [slug, minuta] of Object.entries(minutas)) {
    const md = minuta.lerModelo()
    // Mustache parse devolve arrays com [tipo, valor, inicio, fim]
    const tags = Mustache.parse(md)
    const chavesNoMarkdown = tags.filter(t => t[0] === 'name').map(t => t[1])
    
    const chavesNoEsquema = Object.keys(minuta.esquema.shape)

    for (const chave of chavesNoMarkdown) {
      if (!chavesNoEsquema.includes(chave)) {
        throw new Error(`A minuta ${slug} usa a variavel {{${chave}}} no Markdown, mas ela não existe no esquema Zod.`)
      }
    }
    expect(true).toBe(true)
  }
})

test('preencher a minuta com dados mockados nao deixa placeholder', () => {
  const md = minutas['advocacia-honorarios'].lerModelo()
  const renderizado = Mustache.render(md, {
    contratanteNome: 'Empresa Falsa',
    contratanteDocumento: '00.000.000/0001-00',
    contratadoNome: 'Doutor Bragaus',
    contratadoOab: 'OAB/SP 123456',
    valorTotal: 'R$ 10.000,00',
    foro: 'São Paulo/SP'
  })
  
  expect(renderizado).toContain('Empresa Falsa')
  expect(renderizado).not.toContain('{{contratanteNome}}')
})
