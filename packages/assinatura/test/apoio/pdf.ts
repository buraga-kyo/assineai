import { PDFDocument, StandardFonts } from 'pdf-lib'

/** PDF de uma página com um texto, gerado na hora: nada de fixture binária no repo. */
export async function gerarPdf(texto = 'Documento de teste'): Promise<Buffer> {
  const documento = await PDFDocument.create()
  const pagina = documento.addPage([595, 842])
  const fonte = await documento.embedFont(StandardFonts.Helvetica)
  pagina.drawText(texto, { x: 50, y: 780, size: 18, font: fonte })
  return Buffer.from(await documento.save())
}

/** Quantas vezes a marca aparece nos bytes do PDF (lido como latin1, sem estragar o binário). */
export function contarMarca(pdf: Buffer, marca: string): number {
  return pdf.toString('latin1').split(marca).length - 1
}
