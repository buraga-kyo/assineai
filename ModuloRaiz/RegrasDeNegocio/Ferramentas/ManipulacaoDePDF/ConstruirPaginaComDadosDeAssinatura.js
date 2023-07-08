const { Documento, Signatario, Arquivo } = require("../../../BancoDeDados/Conector").Tabelas;
const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require("pdf-lib");
const GeradorDeQRCode = require("../FuncoesGenericas/GeradorDeQRCode");
const fs = require("fs");


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
    
    const BordaDoTopo = Pagina.getHeight() - 40
    const BordaDaEsquerda = 26
    
    Pagina.drawText('assina aí', {
        x: BordaDaEsquerda,
        y: BordaDoTopo,
        size: 20,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })

    Pagina.drawText('Gerado em 28 de Junho de 2023, Hora 21:52', {
        x: 422,
        y: 810,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    Pagina.drawText('Datas e Horários em UTC-0300 (America/Sao_Paulo)', {
        x: 397,
        y: 800,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    Pagina.drawLine({ 
        start: { x: BordaDaEsquerda, y: 785 }, 
        end: { x: 570, y: 785 },
        thickness: 0.5,
        color: rgb(0.78,0.78,0.78)
    })

    Pagina.drawText(DocumentoNome+'.pdf', {
        x: BordaDaEsquerda,
        y: 750,
        size: 12,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })

    Pagina.drawText('Identificação do documento:', {
        x: BordaDaEsquerda,
        y: 737,
        size: 8,
        font: HelveticaBold,
        color: rgb(0.46,0.46,0.46)
    })

    Pagina.drawText(DocumentoGUID, {
        x: 137,
        y: 737,
        size: 8,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    Pagina.drawText('Hash do documento original (SHA256):', {
        x: BordaDaEsquerda,
        y: 727,
        size: 8,
        font: HelveticaBold,
        color: rgb(0.46,0.46,0.46)
    })

    Pagina.drawText(DocumentoGUID, {
        x: 177,
        y: 727,
        size: 8,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    const QRCodeBuffer = await GeradorDeQRCode(DocumentoGUID, 'https://pdf-lib.js.org/#examples')

    const QRCodeImage = await PDF.embedPng(QRCodeBuffer)

    Pagina.drawImage(QRCodeImage, {
        x: 513,
        y: 709,
        width: 60,
        height: 60,
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
    
    Pagina.drawLine({ 
        start: { x: BordaDaEsquerda, y: 690 }, 
        end: { x: 570, y: 690 },
        thickness: 0.5,
        color: rgb(0.78,0.78,0.78)
    })
}

function ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID, ColecaoDeSignatarios) {

    const BordaDaEsquerda = 26    

    Pagina.drawText('Assinaturas', {
        x: BordaDaEsquerda,
        y: 660,
        size: 15,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
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

async function ConstruirRodaPe(PDF, Pagina, Helvetica, DocumentoGUID, PosicaoY) {

    Pagina = PDF.addPage()

    Pagina.drawText('Hash do documento original', {
        x: 80,
        y: 125,
        size: 7,
        font: Helvetica
    })

    const ICPBuffer = fs.readFileSync('./ArquivosTemporarios/ICP.png');

    const ICPPNG = await PDF.embedPng(ICPBuffer)

    const DimensaoICPPNG = ICPPNG.scale(0.2)

    Pagina.drawImage(ICPPNG, {
        x: 17,
        y: 110,
        width: DimensaoICPPNG.width,
        height: DimensaoICPPNG.height,
    })

    Pagina.drawLine({ start: { x: 17, y: 100 }, end: { x: 570, y: 100 } })

    Pagina.drawText(`Este Log é exclusivo ao, e deve ser considerado parte do, documento número ${DocumentoGUID}`, {
        x: 17,
        y: 80,
        size: 7,
        font: Helvetica
    })

    Pagina.drawText('de acordo com os Termos de Uso da ZapSign disponível em zapsign.com.brí', {
        x: 17,
        y: 70,
        size: 7,
        font: Helvetica
    })

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