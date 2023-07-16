const { Documento, Signatario, Arquivo } = require("../../../BancoDeDados/Conector").Tabelas;
const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require("pdf-lib");
const GeradorDeQRCode = require("../FuncoesGenericas/GeradorDeQRCode");
const DataAtualFormatada = require("../FuncoesGenericas/DataAtualFormatada")
const fs = require("fs");

module.exports = async (DocumentoId, SignatarioId) =>  {

    const { dataValues: RegistrosDoDocumento } = await Documento.findByPk(DocumentoId)
    const { dataValues: RegistrosDoArquivo } = await Arquivo.findByPk(RegistrosDoDocumento.ArquivoOriginalId)
    
    const BufferDoBase64 = Buffer.from(RegistrosDoArquivo.ArquivoBase64, 'base64')
    const PDF = await PDFDocument.load(BufferDoBase64)

    const HelveticaBold = await PDF.embedFont(StandardFonts.HelveticaBold)
    const Helvetica = await PDF.embedFont(StandardFonts.Helvetica)
    
    var Pagina = PDF.addPage()

    await ConstruirCabecalho(PDF, Pagina, Helvetica, HelveticaBold, RegistrosDoDocumento.DocumentoNome, RegistrosDoDocumento.DocumentoToken, RegistrosDoDocumento.DocumentoHashDoPDFOriginal)
    await ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, DocumentoId, RegistrosDoDocumento.DocumentoToken)

    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')
    
    return DocumentoBase64Atualizado
}

async function ConstruirCabecalho(PDF, Pagina, Helvetica, HelveticaBold, DocumentoNome, DocumentoToken, HashDocumentoOriginal) {

    const BordaDoTopo = Pagina.getHeight() - 40
    const BordaDaEsquerda = 26
    
    Pagina.drawText('assina aí', {
        x: BordaDaEsquerda,
        y: BordaDoTopo,
        size: 20,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })

    Pagina.drawText(`Gerado: ${DataAtualFormatada()}`, {
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

    Pagina.drawText(DocumentoToken, {
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

    const LinkVerificadorDeAutenticidade = process.env.ORIGIN+'/verificar/autenticidade?doc='+DocumentoToken

    const QRCodeBuffer = await GeradorDeQRCode(DocumentoToken, LinkVerificadorDeAutenticidade)

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

}

async function ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, DocumentoId, DocumentoToken) {

    Pagina.drawLine({ 
        start: { x: 26, y: 690 }, 
        end: { x: 240, y: 690 },
        thickness: 0.5,
        color: rgb(0.78,0.78,0.78)
    })

    Pagina.drawText('Assinaturas', {
        x: 250,
        y: 685,
        size: 15,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })    

    Pagina.drawLine({ 
        start: { x: 345, y: 690 }, 
        end: { x: 570, y: 690 },
        thickness: 0.5,
        color: rgb(0.78,0.78,0.78)
    })

    await ConstruirEspacoDeAssinatura(DocumentoId, PDF, Pagina, HelveticaBold, Helvetica, DocumentoToken)

}

async function ConstruirEspacoDeAssinatura(DocumentoId, PDF, Pagina, HelveticaBold, Helvetica, DocumentoToken) {

    let PosicaoY = 600
    var PaginaAtual = Pagina

    const ColecaoDeSignatarios = await Signatario.findAll({ where: { DocumentoId } , order: [ ['SignatarioStatusAssinatura', 'ASC'] ]})
    
    await Promise.all(ColecaoDeSignatarios.map(async (Signatario) => {

        const BufferAssinaturaPendente = fs.readFileSync('./Arquivos/Permanente/pendente.png')
        const AssinaturaPendentePNG = await PDF.embedPng(BufferAssinaturaPendente)

        const BufferAssinaturaAssinada = fs.readFileSync('./Arquivos/Permanente/assinado.png')
        const AssinadoPNG = await PDF.embedPng(BufferAssinaturaAssinada)

        if (PosicaoY == 0) {
            PosicaoY = 800
            PaginaAtual = PDF.addPage()
        }

        PaginaAtual.drawText(Signatario.SignatarioNome, {
            x: 47,
            y: PosicaoY,
            size: 10,
            font: HelveticaBold,
            color: rgb(0.14,0.14,0.14)
        })

        if (Signatario.SignatarioStatusAssinatura == "pendente") {
            
            PaginaAtual.drawImage(AssinaturaPendentePNG, {
                x: 25,
                y: PosicaoY-7,
                width: 15,
                height: 15,
            })

            PaginaAtual.drawText('Assinatura pendente', {
                x: 47,
                y: PosicaoY-10,
                size: 7,
                font: Helvetica,
                color: rgb(0.46,0.46,0.46)
            })        
    
            PosicaoY = PosicaoY-50

        } else {

            PaginaAtual.drawImage(AssinadoPNG, {
                x: 25,
                y: PosicaoY-7,
                width: 16,
                height: 16,
            })

            PaginaAtual.drawText('documento assinado', {
                x: 47,
                y: PosicaoY-10,
                size: 7,
                font: Helvetica,
                color: rgb(0.46,0.46,0.46)
            })   

            PosicaoY = PosicaoY-50
        }
    }));

    PosicaoY = PosicaoY - 20

    if (PosicaoY < 100) {
        PaginaAtual = PDF.addPage()
        PosicaoY = 800
    }

    const ICPBuffer = fs.readFileSync('./Arquivos/Permanente/ICP.png');

    const ICPPNG = await PDF.embedPng(ICPBuffer)

    const DimensaoICPPNG = ICPPNG.scale(0.06)

    PaginaAtual.drawImage(ICPPNG, {
        x: 26,
        y: PosicaoY-25,
        width: DimensaoICPPNG.width,
        height: DimensaoICPPNG.height,
    })

    PaginaAtual.drawLine({
        start: { x: 26, y: PosicaoY-35 }, 
        end: { x: 570, y: PosicaoY-35 },
        thickness: 0.5,
        color: rgb(0.78,0.78,0.78)
    })

    PaginaAtual.drawText(`Documento assinado com validade jurídica`, {
        x: 70,
        y: PosicaoY+13,
        size: 9,
        font: HelveticaBold,
        color: rgb(0.46,0.46,0.46)
    })

    PaginaAtual.drawText('Integridade do documento certificada digitalmente pelo Assina Aí (ICP Brasil):', {
        x: 70,
        y: PosicaoY,
        size: 9,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    PaginaAtual.drawText('Este log é exclusivo e deve ser considerado como parte do documento '+DocumentoToken, {
        x: 70,
        y: PosicaoY-12,
        size: 9,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    PaginaAtual.drawText('De acordo com os termos de uso do Assina Aí, disponivel em www.assinaai.com.br', {
        x: 70,
        y: PosicaoY-25,
        size: 9,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    const QuantidadeDePaginas = PDF.getPageIndices()

    for (const PaginaAtual of QuantidadeDePaginas) {
        const Pagina = PDF.getPage(PaginaAtual)

        Pagina.drawText('assina aí '+DocumentoToken,  {
            x: 26,
            y: 5,
            size: 6,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })
    }

    //ConstruirRodaPe(PDF, PaginaAtual, PosicaoY, Helvetica, HelveticaBold, DocumentoToken)

}

async function ConstruirRodaPe(PDF, PaginaAtual, PosicaoY, Helvetica, HelveticaBold, DocumentoToken) {

    if (PosicaoY < 100) {
        PaginaAtual = PDF.addPage()
        PosicaoY = 800
    }

    const ICPBuffer = fs.readFileSync('./Arquivos/Permanente/ICP.png');

    const ICPPNG = await PDF.embedPng(ICPBuffer)

    const DimensaoICPPNG = ICPPNG.scale(0.06)

    PaginaAtual.drawImage(ICPPNG, {
        x: 26,
        y: PosicaoY,
        width: DimensaoICPPNG.width,
        height: DimensaoICPPNG.height,
    })

    PaginaAtual.drawLine({
        start: { x: 26, y: PosicaoY }, 
        end: { x: 570, y: PosicaoY },
        thickness: 0.5,
        color: rgb(0.78,0.78,0.78)
    })

    PaginaAtual.drawText(`Documento assinado com validade jurídica`, {
        x: 70,
        y: PosicaoY,
        size: 9,
        font: HelveticaBold,
        color: rgb(0.46,0.46,0.46)
    })

    PaginaAtual.drawText('Integridade do documento certificada digitalmente pelo Assina Aí (ICP Brasil):', {
        x: 70,
        y: PosicaoY,
        size: 9,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    PaginaAtual.drawText('Este log é exclusivo e deve ser considerado como parte do documento '+DocumentoToken, {
        x: 70,
        y: PosicaoY,
        size: 9,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    PaginaAtual.drawText('De acordo com os termos de uso do Assina Aí, disponivel em www.assinaai.com.br', {
        x: 70,
        y: PosicaoY,
        size: 9,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    const QuantidadeDePaginas = PDF.getPageIndices()

    for (const PaginaAtual of QuantidadeDePaginas) {
        const Pagina = PDF.getPage(PaginaAtual)

        Pagina.drawText('assina aí '+DocumentoGUID,  {
            x: 26,
            y: 5,
            size: 6,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
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