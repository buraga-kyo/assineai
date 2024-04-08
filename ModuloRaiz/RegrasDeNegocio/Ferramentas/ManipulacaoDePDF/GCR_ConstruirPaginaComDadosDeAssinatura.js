const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require("pdf-lib");
const GeradorDeQRCode = require("../FuncoesGenericas/GeradorDeQRCode");
const DataAtualFormatada = require("../FuncoesGenericas/DataAtualFormatada")
const fs = require("fs");

module.exports = async (DadosDeAssinatura) =>  {

    const BufferDoBase64 = Buffer.from(DadosDeAssinatura.DocumentoBase64, 'base64')
    const PDF = await PDFDocument.load(BufferDoBase64)

    const HelveticaBold = await PDF.embedFont(StandardFonts.HelveticaBold)
    const Helvetica = await PDF.embedFont(StandardFonts.Helvetica)
    
    var Pagina = PDF.addPage()

    await ConstruirCabecalho(
        PDF, 
        Pagina, 
        Helvetica, 
        HelveticaBold,
        DadosDeAssinatura.DocumentoTitulo,
        DadosDeAssinatura.DocumentoToken, 
        DadosDeAssinatura.DocumentoHASH,
        DadosDeAssinatura.DocumentoLinkAssinatura,
        DadosDeAssinatura.AssinaturaDataCriacao
    )

    const { PaginaAtual, PosicaoY } = await ConstruirCorpo(
        PDF, 
        Pagina, 
        Helvetica, 
        HelveticaBold,
        DadosDeAssinatura
    )
   
    await ConstruirRodaPe(
        PDF, 
        PaginaAtual, 
        PosicaoY, 
        Helvetica, 
        HelveticaBold, 
        DadosDeAssinatura.DocumentoToken
    )

    const BytesDoPDF = await PDF.save()
    const DocumentoBase64Atualizado = Buffer.from(BytesDoPDF).toString('base64')
    
    return DocumentoBase64Atualizado
}

async function ConstruirCabecalho(
    PDF,
    Pagina, 
    Helvetica, 
    HelveticaBold, 
    DocumentoTitulo, 
    DocumentoToken, 
    HashDocumentoOriginal, 
    DocumentoLinkAssinatura,
    AssinaturaDataCriacao) {

    const BordaDoTopo = Pagina.getHeight() - 40
    const BordaDaEsquerda = 26
    
    Pagina.drawText(DocumentoTitulo, {
        x: BordaDaEsquerda,
        y: BordaDoTopo,
        size: 20,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })

    Pagina.drawText(`Gerado: ${AssinaturaDataCriacao}`, {
        x: 470,
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

    Pagina.drawText(DocumentoTitulo+'.pdf', {
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

    const LinkVerificadorDeAutenticidade = DocumentoLinkAssinatura

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

async function ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, DadosDeAssinatura) {

    Pagina.drawText('Assinaturas', {
        x: 26,
        y: 685,
        size: 15,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })    

    Pagina.drawLine({ 
        start: { x: 120, y: 690 }, 
        end: { x: 570, y: 690 },
        thickness: 0.5,
        color: rgb(0.78,0.78,0.78)
    })

    let PosicaoY = 650
    var PaginaAtual = Pagina

    const BufferAssinaturaAssinada = fs.readFileSync(process.env.BaseDir+'/Arquivos/Permanente/assinado.png')
    const AssinadoPNG = await PDF.embedPng(BufferAssinaturaAssinada)   
    
    // Dados do Cliente
    PaginaAtual.drawText(DadosDeAssinatura.SignatarioNome, {
        x: 47,
        y: PosicaoY,
        size: 10,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })    

    PaginaAtual.drawImage(AssinadoPNG, {
        x: 25,
        y: PosicaoY-7,
        width: 16,
        height: 16,
    })

    PaginaAtual.drawText('Documento assinado como cliente', {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })   

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText('Pontos de autenticação:', {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })  

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText('IP: '+DadosDeAssinatura.SignatarioIp, {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })   

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText('Dispositivo: '+DadosDeAssinatura.SignatarioDispositivo, {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })  

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText(DadosDeAssinatura.SignatarioDataAssinatura, {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    }) 

    PosicaoY = PosicaoY-10

    if (DadosDeAssinatura.SignatarioFormaAutenticacao === 'email') {
        PaginaAtual.drawText('Email: '+DadosDeAssinatura.SignatarioEmail+' (autenticado com código enviado exclusivamente a este e-mail)', {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('Celular: '+DadosDeAssinatura.SignatarioCelular, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })         
    } else {
        PaginaAtual.drawText('Email: '+DadosDeAssinatura.SignatarioEmail, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('Celular: '+DadosDeAssinatura.SignatarioCelular+' (autenticado com código enviado exclusivamente a este WhatsApp)', {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        }) 
    }

    PosicaoY = PosicaoY-40

    // Dados da Empresa
    PaginaAtual.drawText(DadosDeAssinatura.SignatarioEmpresaNome, {
        x: 47,
        y: PosicaoY,
        size: 10,
        font: HelveticaBold,
        color: rgb(0.14,0.14,0.14)
    })    

    PaginaAtual.drawImage(AssinadoPNG, {
        x: 25,
        y: PosicaoY-7,
        width: 16,
        height: 16,
    })

    PaginaAtual.drawText('Documento assinado como empresa', {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })   

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText('Pontos de autenticação:', {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })  

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText('IP: '+DadosDeAssinatura.SignatarioEmpresaIp, {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })   

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText('Dispositivo: '+DadosDeAssinatura.SignatarioEmpresaDispositivo, {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })  

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText(DadosDeAssinatura.SignatarioEmpresaDataAssinatura, {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    }) 

    PosicaoY = PosicaoY-10

    PaginaAtual.drawText('Email: '+DadosDeAssinatura.SignatarioEmpresaEmail, {
        x: 47,
        y: PosicaoY-10,
        size: 7,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })  

    PosicaoY = PosicaoY-40    

    // Dados da Testemunha 1
    if (DadosDeAssinatura?.SignatarioTestemunha1Nome) {
        PaginaAtual.drawText(DadosDeAssinatura.SignatarioTestemunha1Nome, {
            x: 47,
            y: PosicaoY,
            size: 10,
            font: HelveticaBold,
            color: rgb(0.14,0.14,0.14)
        })    

        PaginaAtual.drawImage(AssinadoPNG, {
            x: 25,
            y: PosicaoY-7,
            width: 16,
            height: 16,
        })

        PaginaAtual.drawText('Documento assinado como testemunha', {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })   

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('Pontos de autenticação:', {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })  

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('IP: '+DadosDeAssinatura.SignatarioEmpresaIp, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })   

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('Dispositivo: '+DadosDeAssinatura.SignatarioEmpresaDispositivo, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })  

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText(DadosDeAssinatura.SignatarioEmpresaDataAssinatura, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        }) 

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('Email: '+DadosDeAssinatura.SignatarioTestemunha1Email, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })  

        PosicaoY = PosicaoY-40
    }

    // Dados da Testemunha 2
    if (DadosDeAssinatura?.SignatarioTestemunha2Nome) {
        PaginaAtual.drawText(DadosDeAssinatura.SignatarioTestemunha2Nome, {
            x: 47,
            y: PosicaoY,
            size: 10,
            font: HelveticaBold,
            color: rgb(0.14,0.14,0.14)
        })    

        PaginaAtual.drawImage(AssinadoPNG, {
            x: 25,
            y: PosicaoY-7,
            width: 16,
            height: 16,
        })

        PaginaAtual.drawText('Documento assinado como testemunha', {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })   

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('Pontos de autenticação:', {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })  

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('IP: '+DadosDeAssinatura.SignatarioEmpresaIp, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })   

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('Dispositivo: '+DadosDeAssinatura.SignatarioEmpresaDispositivo, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })  

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText(DadosDeAssinatura.SignatarioEmpresaDataAssinatura, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        }) 

        PosicaoY = PosicaoY-10

        PaginaAtual.drawText('Email: '+DadosDeAssinatura.SignatarioTestemunha2Email, {
            x: 47,
            y: PosicaoY-10,
            size: 7,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })  

        PosicaoY = PosicaoY-40
    }

    return {PaginaAtual, PosicaoY}
}

async function ConstruirRodaPe(PDF, PaginaAtual, PosicaoY, Helvetica, HelveticaBold, DocumentoToken) {

    PosicaoY = PosicaoY - 20

    if (PosicaoY < 100) {
        PaginaAtual = PDF.addPage()
        PosicaoY = 800
    }

    const ICPBuffer = fs.readFileSync(process.env.BaseDir+'/Arquivos/Permanente/ICP.png');

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

    PaginaAtual.drawText('Integridade do documento certificada digitalmente pela Dwith (ICP Brasil):', {
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

    PaginaAtual.drawText('De acordo com os termos de uso do Dwith, disponivel em www.dwith.com.br', {
        x: 70,
        y: PosicaoY-25,
        size: 9,
        font: Helvetica,
        color: rgb(0.46,0.46,0.46)
    })

    const QuantidadeDePaginas = PDF.getPageIndices()

    for (const PaginaAtual of QuantidadeDePaginas) {
        const Pagina = PDF.getPage(PaginaAtual)

        Pagina.drawText('Dwith '+DocumentoToken,  {
            x: 26,
            y: 5,
            size: 6,
            font: Helvetica,
            color: rgb(0.46,0.46,0.46)
        })
    }
}