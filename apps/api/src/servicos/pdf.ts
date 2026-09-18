import { PDFDocument, rgb, StandardFonts, PDFName, PDFDict, PDFArray, PDFNumber, PDFString } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export interface DadosCarimbo {
  pagina: number // 1-based, como o usuário vê
  proporcaoX: number // 0 a 1
  proporcaoY: number // 0 a 1
  larguraCampoProp?: number // 0 a 1, opcional, padrão 0.3 (30% da largura)
  alturaCampoProp?: number // 0 a 1, opcional, padrão 0.05 (5% da altura)
  nome: string
  canal: string
  dataHora: string
  codigo: string
  hashPedaço: string
  rabiscoBytes?: Uint8Array
}

function parseHex(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255
  }
}

export async function adicionarRelatorioAoPdf(
  pdfBytes: Uint8Array, 
  envelope: any, 
  signatarios: any[], 
  evidencias: any[], 
  tema: any, 
  qrBuffer: Buffer
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  pdfDoc.registerFontkit(fontkit)
  
  // Usaremos uma fonte padrão por enquanto para garantir robustez, mas poderia ler do buffer do tema
  const fonteRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fonteBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const corFundo = tema?.corFundo ? rgb(parseHex(tema.corFundo).r, parseHex(tema.corFundo).g, parseHex(tema.corFundo).b) : rgb(0.9, 0.9, 0.9)
  const corPrimaria = tema?.corPrimaria ? rgb(parseHex(tema.corPrimaria).r, parseHex(tema.corPrimaria).g, parseHex(tema.corPrimaria).b) : rgb(0.1, 0.5, 0.2)
  const corTexto = rgb(0.1, 0.1, 0.1)

  const pagina = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width, height } = pagina.getSize()
  
  let cursorY = height - 50
  
  // Cabeçalho
  pagina.drawText('Relatório de Assinaturas', { x: 50, y: cursorY, size: 24, font: fonteBold, color: corPrimaria })
  cursorY -= 40
  
  pagina.drawText(`Documento: ${envelope.titulo}`, { x: 50, y: cursorY, size: 14, font: fonteBold, color: corTexto })
  cursorY -= 20
  pagina.drawText(`Código Único: ${envelope.codigoPublico}`, { x: 50, y: cursorY, size: 12, font: fonteRegular, color: corTexto })
  cursorY -= 40

  // Signatários
  pagina.drawText('Signatários:', { x: 50, y: cursorY, size: 16, font: fonteBold, color: corPrimaria })
  cursorY -= 20

  for (const sig of signatarios) {
    const ev = evidencias.find(e => e.signatarioId === sig.id && e.tipo === 'assinatura_concluida')
    const statusText = ev ? `Assinado via ${ev.userAgent || 'Desconhecido'} em ${ev.criadoEm.toLocaleString()}` : 'Pendente'
    
    pagina.drawText(`- ${sig.nome} (${sig.email})`, { x: 50, y: cursorY, size: 12, font: fonteBold, color: corTexto })
    cursorY -= 15
    pagina.drawText(`  Status: ${statusText}`, { x: 50, y: cursorY, size: 10, font: fonteRegular, color: corTexto })
    if (ev?.ipServidor) {
      cursorY -= 15
      pagina.drawText(`  IP Registrado: ${ev.ipServidor}`, { x: 50, y: cursorY, size: 10, font: fonteRegular, color: corTexto })
    }
    cursorY -= 25
  }

  // QR Code
  const imagemQr = await pdfDoc.embedPng(qrBuffer)
  const tamanhoQr = 100
  pagina.drawImage(imagemQr, {
    x: width - tamanhoQr - 50,
    y: 50,
    width: tamanhoQr,
    height: tamanhoQr
  })
  
  pagina.drawText('Valide a autenticidade apontando a câmera', { 
    x: width - tamanhoQr - 80, 
    y: 40, 
    size: 10, 
    font: fonteRegular, 
    color: corTexto 
  })

  // Rodapé
  pagina.drawText('Assinaturas realizadas na plataforma AssineAi com validade jurídica garantida por carimbo do tempo e selo criptográfico ICP-Brasil.', {
    x: 50, y: 50, size: 8, font: fonteRegular, color: rgb(0.5, 0.5, 0.5), maxWidth: 350
  })

  return await pdfDoc.save()
}

export async function adicionarQrELinkDeVerificacao(pdfBytes: Uint8Array, codigo: string, qrBuffer: Buffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const paginas = pdfDoc.getPages()
  if (paginas.length === 0) return await pdfDoc.save()
  
  // Desenha na ultima pagina pra simplificar o exemplo, mas a rigor poderia ser em todas
  const pagina = paginas[paginas.length - 1]
  if (!pagina) return await pdfDoc.save()
  const largura = pagina.getWidth()
  const altura = pagina.getHeight()
  
  // Canto inferior direito pro QR
  const tamanhoQr = 60
  const padding = 20
  const posX = largura - tamanhoQr - padding
  const posY = padding
  
  const imagemQr = await pdfDoc.embedPng(qrBuffer)
  
  pagina.drawImage(imagemQr, {
    x: posX,
    y: posY,
    width: tamanhoQr,
    height: tamanhoQr
  })

  // Anotação do Link clicável em cima do QR
  const appUrl = process.env.URL_APP || 'http://localhost:5173'
  const url = `${appUrl}/v/${codigo}`

  const linkAnotacao = pdfDoc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [posX, posY, posX + tamanhoQr, posY + tamanhoQr],
    Border: [0, 0, 0],
    A: {
      Type: 'Action',
      S: 'URI',
      URI: PDFString.of(url)
    }
  })

  const linkReference = pdfDoc.context.register(linkAnotacao)
  pagina.node.addAnnot(linkReference)

  return await pdfDoc.save()
}

export async function carimbarDocumento(pdfBytes: Uint8Array, carimbos: DadosCarimbo[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const paginas = pdfDoc.getPages()

  for (const carimbo of carimbos) {
    // pdf-lib usa 0-based no getPages()
    const indicePagina = carimbo.pagina - 1
    if (indicePagina < 0 || indicePagina >= paginas.length) {
      continue // ignora se a página não existir
    }

    const paginaPdf = paginas[indicePagina]
    if (!paginaPdf) continue
    
    // O pdf-lib as vezes tem getWidth/getHeight diferente se a página tiver Rotation
    // Mas a lib expõe os métodos seguros: getSize() que já deveria considerar rotação ou não
    // Vamos pegar largura e altura brutas e tratar depois se precisar
    const largura = paginaPdf.getWidth()
    const altura = paginaPdf.getHeight()

    // Tamanho do campo do carimbo (box)
    const propW = carimbo.larguraCampoProp || 0.3
    const propH = carimbo.alturaCampoProp || 0.08

    const larguraCampo = largura * propW
    const alturaCampo = altura * propH

    // Conversão de (x,y) de 0 a 1 (sendo 0,0 no canto superior esquerdo pro usuário)
    // para a coordenada do pdf-lib, onde 0,0 é o canto INFERIOR esquerdo.
    // Fórmula dada pela spec: X = x * largura, Y = altura - (y + alturaCampo) * altura
    const posX = carimbo.proporcaoX * largura
    // Atenção: a proporcaoY tbm é de cima pra baixo, o pdf-lib desenha de baixo pra cima
    // A fórmula da spec considera que y é do canto superior esquerdo e desce
    const posY = altura - (carimbo.proporcaoY * altura) - alturaCampo

    // Se tem rabisco, a gente desenha a imagem
    if (carimbo.rabiscoBytes) {
      let imagem = null
      try {
        // Tenta PNG primeiro
        imagem = await pdfDoc.embedPng(carimbo.rabiscoBytes)
      } catch (e) {
        // Tenta JPG se falhar
        imagem = await pdfDoc.embedJpg(carimbo.rabiscoBytes)
      }

      if (imagem) {
        const dims = imagem.scaleToFit(larguraCampo, alturaCampo)
        paginaPdf.drawImage(imagem, {
          x: posX,
          y: posY,
          width: dims.width,
          height: dims.height
        })
      }
    } else {
      // Se não tem rabisco, é o carimbo textual
      const texto = `Assinado eletronicamente por ${carimbo.nome}\nvia ${carimbo.canal} em ${carimbo.dataHora}\nCód: ${carimbo.codigo}\nSHA-256: ${carimbo.hashPedaço}`
      
      paginaPdf.drawText(texto, {
        x: posX,
        y: posY,
        size: 8,
        font: fonte,
        color: rgb(0, 0, 0),
        lineHeight: 10,
        maxWidth: larguraCampo
      })
    }
  }

  return await pdfDoc.save()
}
