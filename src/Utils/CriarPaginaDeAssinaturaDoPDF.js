const { PDFDocument } = require("pdf-lib");
// const { appendFileSync } = require("fs");

module.exports = async (DocumentoBase64) =>  {
    
    const BufferDoBase64 = Buffer.from(DocumentoBase64, 'base64');

    const PDF = await PDFDocument.load(BufferDoBase64)

    const pagina = PDF.addPage();
    pagina.drawText('Exemplo', {x:0,y:820,size:20})
    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')

    return DocumentoBase64Atualizado

}

// module.exports = ({ body }, res, proximaFuncao) =>  {
    
//     var Base64DoDocumento = body.DocumentoBase64
//     var BufferDoDocumento = Buffer.from(Base64DoDocumento, 'base64');

//     PDFDocument.load(BufferDoDocumento).then(pdfDoc => {
//         const page = pdfDoc.addPage();
//         page.drawText('You can create PDFs!', {x:0,y:820,size:20});
//         pdfDoc.save().then(pdfBytes => {
//             console.log(pdfBytes)
//             body.Documento = pdfBytes
//             appendFileSync('DOCUMENTO_ASSINADO.pdf', Buffer.from(pdfBytes));
//             proximaFuncao();
//         });
//     });
// }
