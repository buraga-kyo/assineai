import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

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
