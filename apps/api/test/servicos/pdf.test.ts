import { test, expect } from 'vitest'
import { PDFDocument, rgb } from 'pdf-lib'
import { carimbarDocumento, DadosCarimbo, adicionarQrELinkDeVerificacao } from '../../src/servicos/pdf.js'
import { gerarQrEmMemoria } from '../../src/servicos/qr.js'

test('adiciona qr e anotação de link sem corromper o pdf', async () => {
  const pdfMock = await PDFDocument.create()
  pdfMock.addPage([595.28, 841.89])
  const bytesIniciais = await pdfMock.save()

  const qrBuffer = await gerarQrEmMemoria('TESTE-123')
  const pdfFinal = await adicionarQrELinkDeVerificacao(bytesIniciais, 'TESTE-123', qrBuffer)
  
  const pdfCarregado = await PDFDocument.load(pdfFinal)
  expect(pdfCarregado.getPageCount()).toBe(1)
})

test('carimba o documento na pagina e proporcoes certas', async () => {
  // Criar um PDF A4 retrato
  const pdfMock = await PDFDocument.create()
  const pagina = pdfMock.addPage([595.28, 841.89]) // A4
  const bytesIniciais = await pdfMock.save()

  const carimbos: DadosCarimbo[] = [
    {
      pagina: 1,
      proporcaoX: 0.5,
      proporcaoY: 0.5,
      nome: 'João Testador',
      canal: 'whatsapp',
      dataHora: '12/09/2026',
      codigo: 'ENV-123',
      hashPedaço: 'a1b2c3d4'
    }
  ]

  const pdfCarimbadoBytes = await carimbarDocumento(bytesIniciais, carimbos)
  const pdfCarimbado = await PDFDocument.load(pdfCarimbadoBytes)
  
  // Apenas garantimos que não corrompeu e tem a página
  expect(pdfCarimbado.getPageCount()).toBe(1)
  
  // (Limitação) Verificar o conteúdo desenhado requereria fazer o parsing das streams de draw do PDF.
  // Vamos apenas garantir que o comando não atira erro.
})

test('carimba em pdf formato paisagem', async () => {
  // Criar um PDF A4 paisagem
  const pdfMock = await PDFDocument.create()
  const pagina = pdfMock.addPage([841.89, 595.28]) // A4 paisagem
  const bytesIniciais = await pdfMock.save()

  const carimbos: DadosCarimbo[] = [
    {
      pagina: 1,
      proporcaoX: 0.1,
      proporcaoY: 0.9,
      nome: 'Maria Silva',
      canal: 'email',
      dataHora: '13/09/2026',
      codigo: 'ENV-999',
      hashPedaço: 'ffeeffee'
    }
  ]

  const pdfCarimbadoBytes = await carimbarDocumento(bytesIniciais, carimbos)
  const pdfCarimbado = await PDFDocument.load(pdfCarimbadoBytes)
  
  expect(pdfCarimbado.getPageCount()).toBe(1)
})
