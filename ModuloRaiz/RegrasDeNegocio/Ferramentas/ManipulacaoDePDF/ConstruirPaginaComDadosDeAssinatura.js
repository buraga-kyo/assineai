const { Documento, Signatario, Arquivo } = require("../../../BancoDeDados/Conector").Tabelas;
const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require("pdf-lib");
const GeradorDeQRCode = require("../FuncoesGenericas/GeradorDeQRCode");

module.exports = async (DocumentoBase64, DocumentoId, ColecaoDeSignatarios) =>  {
    const { dataValues: { DocumentoGUID, DocumentoNome } } = await Documento.findByPk(DocumentoId)

    const BufferDoBase64 = Buffer.from(DocumentoBase64, 'base64')
    const PDF = await PDFDocument.load(BufferDoBase64)
    const HelveticaBold = await PDF.embedFont(StandardFonts.HelveticaBold)
    const Helvetica = await PDF.embedFont(StandardFonts.Helvetica)
    var Pagina = PDF.addPage()

    await ConstruirCabecalho(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID)
    PosicaoY = ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID, ColecaoDeSignatarios)
    ConstruirRodaPe(PDF, Pagina, Helvetica, DocumentoGUID, PosicaoY)

    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')

    return DocumentoBase64Atualizado
}


async function ConstruirCabecalho(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID) {
    Pagina.drawText('(Assina AI Logo)', {
        x: 15,
        y: 800,
        size: 15,
        font: HelveticaBold
    })

    Pagina.drawText('Relatório de Assinaturas', {
        x: 140,
        y: 800,
        size: 10,
        font: HelveticaBold
    })

    Pagina.drawText('Datas e Horários em UTC-0300 (America/Sao_Paulo)', {
        x: 400,
        y: 810,
        size: 7,
        font: Helvetica
    })

    Pagina.drawText('Última atualização em 28 Março 2023, 10:19', {
        x: 427,
        y: 800,
        size: 7,
        font: Helvetica
    })

    Pagina.drawLine({ start: { x: 17, y: 780 }, end: { x: 570, y: 780 } })

    Pagina.drawText(DocumentoNome, {
        x: 17,
        y: 750,
        size: 15,
        font: HelveticaBold
    })

    Pagina.drawText('Identificação do Documento: '+DocumentoGUID, {
        x: 17,
        y: 735,
        size: 8,
        font: Helvetica
    })

    const QRCodeBuffer = await GeradorDeQRCode(DocumentoGUID, 'https://pdf-lib.js.org/#examples')

    const QRCodeImage = await PDF.embedPng(QRCodeBuffer)

    Pagina.drawImage(QRCodeImage, {
        x: 495,
        y: 695,
        width: 80,
        height: 80,
    })

    const LinkQRCode = PDF.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [500, 770, 700, 700],
        Border: [2, 2, 2],
        C: [1, 1, 1],
        A: {
            Type: 'Action',
            S: 'URI',
            URI: PDFString.of('https://github.com/Hopding/pdf-lib'),
        },
    });
    const ReferenciaDoLinkQRCode = PDF.context.register(LinkQRCode);

    Pagina.node.set(PDFName.of('Annots'), PDF.context.obj([ReferenciaDoLinkQRCode]));

    Pagina.drawLine({ start: { x: 17, y: 690 }, end: { x: 570, y: 690 } })    
}

function ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID, ColecaoDeSignatarios) {
    Pagina.drawText('Assinaturas', {
        x: 17,
        y: 670,
        size: 15,
        font: HelveticaBold
    })

    let PosicaoY = 630
    let QuantidadeSignatario = 0
    let QuantidadeMaximaSignatario = 12

    ColecaoDeSignatarios.forEach((Signatario) => {

        QuantidadeSignatario++

        if (QuantidadeSignatario == QuantidadeMaximaSignatario) {
            QuantidadeSignatario = 1
            QuantidadeMaximaSignatario = 16
            PosicaoY = 800
            Pagina = PDF.addPage()
        }

        Pagina.drawText(Signatario.SignatarioNome, {
            x: 50,
            y: PosicaoY,
            size: 12,
            font: Helvetica
        })

        Pagina.drawText('Pendente', {
            x: 50,
            y: PosicaoY-15,
            size: 10,
            font: Helvetica
        })        

        PosicaoY = PosicaoY-50

    })

    return PosicaoY
}

function ConstruirRodaPe(PDF, Pagina, Helvetica, DocumentoGUID, PosicaoY) {

    Pagina = PDF.addPage()

    //PosicaoY = PosicaoY-20

    Pagina.drawText('Assina Aí', {
        x: 17,
        y: 40,
        size: 20,
        font: Helvetica
    })

    Pagina.drawLine({ start: { x: 17, y: 30 }, end: { x: 570, y: 30 } })

    const QuantidadeDePaginas = PDF.getPageIndices()

    for (const PaginaAtual of QuantidadeDePaginas) {
        const Pagina = PDF.getPage(PaginaAtual)

        Pagina.drawText('Assina AI '+DocumentoGUID,  {
            x: 15,
            y: 10,
            size: 7,
            font: Helvetica
        })
    }
}
    // const form = PDF.getForm();
  
    // const button = form.createButton('foo.bar');
    // button.addToPage('Hello World!', pagina, {
    //   width: 100,
    //   height: 50,
    //   x: pagina.getWidth() / 2 - 100 / 2,
    //   y: pagina.getHeight() / 2 - 50 / 2,
    // });
  
    // const helloWorldScript = "alert('teste')";
    // button.acroField.getWidgets().forEach((widget) => {
    //   widget.dict.set(
    //     PDFName.of('AA'),
    //     PDF.context.obj({
    //       U: {
    //         Type: 'Action',
    //         S: 'JavaScript',
    //         JS: PDFHexString.fromText(helloWorldScript),
    //       },
    //     }),
    //   );
    // });

    // const PAGE_WIDTH = 500;
    // const PAGE_HEIGHT = 750;
    
    // const createPageLinkAnnotation = (PDF, pageRef) => ////CREATE HYPERLINK METHOD
    // pagina.context.register(
    //     pagina.context.obj({
    //       Type: 'Annot',
    //       Subtype: 'Link',
    //       /* Bounds of the link on the page */
    //       Rect: [
    //         145, // lower left x coord
    //         PAGE_HEIGHT - 200 - 10, // lower left y coord
    //         358, // upper right x coord
    //         PAGE_HEIGHT - 200 + 25, // upper right y coord
    //       ],
    //       /* Give the link a 2-unit-wide border, with sharp corners */
    //       Border: [0, 0, 2],
    //       /* Make the border color blue: rgb(0, 0, 1) */
    //       C: [0, 0, 1],
    //       /* Page to be visited when the link is clicked */
    //       Dest: ['www.google.com', 'XYZ', null, null, null],
    //     }),
    // );

    // const form = PDF.getForm()
    // const button = form.createButton('some.button.field')
    
    // button.addToPage('Do Stuff', pagina, {
    //   x: 50,
    //   y: 75,
    //   width: 200,
    //   height: 100,
    //   textColor: rgb(1, 0, 0),
    //   backgroundColor: rgb(0, 1, 0),
    //   borderColor: rgb(0, 0, 1),
    //   borderWidth: 2,
    //   font: Helvetica,
    // })