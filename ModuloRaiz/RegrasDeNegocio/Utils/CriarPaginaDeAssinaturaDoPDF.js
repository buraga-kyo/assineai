// const HummusRecipe = require('hummus-recipe');
const gs = require("ghostscript-node");
// const hum = require('hummus');

const { PDFDocument } = require("pdf-lib");
// const base64 = require('base64topdf');
const fs = require("fs");
const { writeFileSync } = require("fs");

module.exports = async (DocumentoBase64) =>  {

    //gs.

    // fs.writeFile('input.pdf', DocumentoBase64, 'base64', error => {
    //     if (error) {
    //         throw error;
    //     } else {
    //         console.log('base64 saved!');
    //     }
    // });

    const BufferDoBase64 = Buffer.from(DocumentoBase64, 'base64');

    const PDF = await PDFDocument.load(BufferDoBase64)

    const pagina = PDF.addPage();
    pagina.drawText('Exemplo', {x:0,y:820,size:20})
    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')



    // fs.writeFile('input.pdf', BytesDoPDF, error => {
    //     if (error) {
    //         throw error;
    //     } else {
    //         console.log('base64 saved!');
            
    //         const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');
    //         pdfDoc
    //             // edit 1st page
    //             .editPage(1)
    //             .text('Add some texts to an existing pdf file', 150, 300)
    //             .rectangle(20, 20, 40, 100)
    //             .comment('Add 1st comment annotaion', 200, 300)
    //             .endPage()
    //             // end and save
    //             .endPDF();

    //     }
    // });

    // fs.writeFile("input.pdf", BytesDoPDF, function(err) {
    //     console.log(err);
    //  });



    return DocumentoBase64Atualizado
    

    //const PDF = await PDFDocument.load(BufferDoBase64)

    //const pagina = PDF.addPage();
    //pagina.drawText('Exemplo', {x:0,y:820,size:20})
    //const BytesDoPDF = await PDF.save()
    //const DocumentoBase64Atualizado = Buffer.from(DocumentoBase64)

    // writeFileSync("blank.pdf", await PDF.save());
    // var buf = Buffer.from(DocumentoBase64Atualizado, 'base64');

    // let decodedBase64 = base64.base64Decode(DocumentoBase64Atualizado, 'Exemplo.pdf');
    // console.log(decodedBase64);
    //https://avepdf.com/convert-to-pdfa
    //PDF/A 
    // fs.writeFile("samples.pdf", BufferDoBase64, function(err) {
    //    console.log(err);
    // });

    // return ""//DocumentoBase64Atualizado

}