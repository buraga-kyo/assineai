const { PDFDocument } = require("pdf-lib");

module.exports = async (DocumentoBase64) =>  {

    const BufferDoBase64 = Buffer.from(DocumentoBase64, 'base64');

    const PDF = await PDFDocument.load(BufferDoBase64)

    const pagina = PDF.addPage();
    pagina.drawText('Exemplo', {x:0,y:820,size:20})
    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')

    return DocumentoBase64Atualizado
}