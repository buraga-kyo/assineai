const { Documento, Signatario, Arquivo } = require("../../../BancoDeDados/Conector").Tabelas;
const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require("pdf-lib");
const GeradorDeQRCode = require("../FuncoesGenericas/GeradorDeQRCode");
const fs = require("fs");
const crypto = require("crypto");

module.exports = async (DocumentoBase64, DocumentoId, ColecaoDeSignatarios) =>  {
    const { dataValues: { DocumentoGUID, DocumentoNome } } = await Documento.findByPk(DocumentoId)

    const HashDocumentoOriginal = await RetornarHashDocumentoOriginal(DocumentoId)
    const BufferDoBase64 = Buffer.from(DocumentoBase64, 'base64')
    const PDF = await PDFDocument.load(BufferDoBase64)
    const HelveticaBold = await PDF.embedFont(StandardFonts.HelveticaBold)
    const Helvetica = await PDF.embedFont(StandardFonts.Helvetica)
    var Pagina = PDF.addPage()

    await ConstruirCabecalho(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID, HashDocumentoOriginal)
    PosicaoY = await ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID, ColecaoDeSignatarios)
    ConstruirRodaPe(PDF, Pagina, Helvetica, DocumentoGUID, PosicaoY, 26, HelveticaBold)

    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')

    return DocumentoBase64Atualizado
}

async function RetornarHashDocumentoOriginal(DocumentoId) {
    return new Promise((resolve, reject) => {
    // the file you want to get the hash    
        var fd = fs.createReadStream("./Arquivos/Temporario/"+DocumentoId+"_A.pdf");
        var hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        // read all file and pipe it (write it) to the hash object
        fd.pipe(hash);
        fd.on('end', function() {
            hash.end();
            resolve(hash.read()) // the desired sha1sum
        });
    })
}

async function ConstruirCabecalho(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID, HashDocumentoOriginal) {

    const BordaDoTopo = Pagina.getHeight() - 40
    const BordaDaEsquerda = 26
    
    Pagina.drawText('assina aí', {
        x: BordaDaEsquerda,
        y: BordaDoTopo,
        size: 20,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })

    Pagina.drawText(`Gerado: ${dataAtualFormatada()}`, {
        x: 465,
        y: 810,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    Pagina.drawText('Datas e Horários em UTC-0300', {
        x: 470,
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

    Pagina.drawText(HashDocumentoOriginal, {
        x: 177,
        y: 727,
        size: 8,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    const LinkVerificadorDeAutenticidade = process.env.ORIGIN+'/verificar/autenticidade?doc='+DocumentoGUID

    const QRCodeBuffer = await GeradorDeQRCode(DocumentoGUID, LinkVerificadorDeAutenticidade)

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
            URI: PDFString.of(LinkVerificadorDeAutenticidade),
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

function dataAtualFormatada() {
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
        Hora = data.getHours().toString()
        HoraF = (Hora.length == 1) ? '0'+Hora : Hora
        Minuto = data.getMinutes().toString()
        MinutoF = (Minuto.length == 1) ? '0'+Minuto : Minuto

    return diaF+"/"+mesF+"/"+anoF+' às '+HoraF+'h'+MinutoF+'min';
}

async function ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoGUID, ColecaoDeSignatarios) {

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

    PosicaoY = await ConstruirSignatariosPendentesAssinatura(ColecaoDeSignatarios, PDF, Pagina, PosicaoY, QuantidadeSignatario, QuantidadeMaximaSignatario, HelveticaBold, Helvetica)

    return PosicaoY
}

async function ConstruirSignatariosPendentesAssinatura(ColecaoDeSignatarios, PDF, Pagina, PosicaoY, QuantidadeSignatario, QuantidadeMaximaSignatario, HelveticaBold, Helvetica) {
    ColecaoDeSignatarios.forEach(async (Signatario) => {

        const BufferAssinaturaPendente = fs.readFileSync('./Arquivos/Permanente/pendente.png');
        const AssinaturaPendentePNG = await PDF.embedPng(BufferAssinaturaPendente)

        QuantidadeSignatario++

        if (QuantidadeSignatario == QuantidadeMaximaSignatario) {
            QuantidadeSignatario = 1
            QuantidadeMaximaSignatario = 16
            PosicaoY = 800
            Pagina = PDF.addPage()
        }
    
        Pagina.drawImage(AssinaturaPendentePNG, {
            x: 25,
            y: PosicaoY-7,
            width: 15,
            height: 15,
        })

        Pagina.drawText(Signatario.SignatarioNome, {
            x: 47,
            y: PosicaoY,
            size: 10,
            font: HelveticaBold,
            color: rgb(0.14,0.14,0.14)
        })

        Pagina.drawText('Assinatura pendente', {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })        

        PosicaoY = PosicaoY-50

    })

    return PosicaoY
}

async function ConstruirRodaPe(PDF, Pagina, Helvetica, DocumentoGUID, PosicaoY, BordaDaEsquerda, HelveticaBold) {

    Pagina = PDF.addPage()

    Pagina.drawText('Hash do documento original', {
        x: 80,
        y: 125,
        size: 7,
        font: Helvetica
    })

    const ICPBuffer = fs.readFileSync('./Arquivos/Permanente/ICP.png');

    const ICPPNG = await PDF.embedPng(ICPBuffer)

    const DimensaoICPPNG = ICPPNG.scale(0.05)

    Pagina.drawImage(ICPPNG, {
        x: 26,
        y: 30,
        width: DimensaoICPPNG.width,
        height: DimensaoICPPNG.height,
    })

    Pagina.drawLine({
        start: { x: 26, y: 10 }, 
        end: { x: 570, y: 10 },
        thickness: 0.5,
        color: rgb(0.78,0.78,0.78)
    })

    Pagina.drawText(`Documento assinado com validade juridica`, {
        x: 17,
        y: 80,
        size: 7,
        font: HelveticaBold,
        color: rgb(0.46,0.46,0.46)
    })

    const QuantidadeDePaginas = PDF.getPageIndices()

    for (const PaginaAtual of QuantidadeDePaginas) {
        const Pagina = PDF.getPage(PaginaAtual)

        Pagina.drawText('assina aí '+DocumentoGUID,  {
            x: 15,
            y: 5,
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