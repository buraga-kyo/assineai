const { PDFDocument } = require("pdf-lib");
const { appendFileSync } = require("fs");

module.exports = ({ body }, res, proximaFuncao) =>  {
    
    var Base64DoDocumento = body.DocumentoBase64
    var BufferDoDocumento = Buffer.from(Base64DoDocumento, 'base64');

    PDFDocument.load(BufferDoDocumento).then(pdfDoc => {
        const page = pdfDoc.addPage();
        page.drawText('You can create PDFs!', {x:0,y:820,size:20});
        pdfDoc.save().then(pdfBytes => {
            console.log(pdfBytes)
            console.log(typeof(pdfBytes))
            body.Documento = pdfBytes
            appendFileSync('DOCUMENTO_ASSINADO.pdf', Buffer.from(pdfBytes));
            proximaFuncao();
        });
    });
}
