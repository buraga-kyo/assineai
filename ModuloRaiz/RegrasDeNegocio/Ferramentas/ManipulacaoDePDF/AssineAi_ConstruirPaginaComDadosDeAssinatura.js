const { PDFDocument, StandardFonts, rgb, PDFName, PDFString, degrees } = require("pdf-lib");
const GeradorDeQRCode = require("../FuncoesGenericas/GeradorDeQRCode");
const fs = require("fs");
const NewPDFDocument = require('pdfkit');
const sizeOf = require('image-size');

module.exports = async (Documento, Signatarios, selfie) =>  {

    const PDF = await PDFDocument.load(Documento.DocumentoBuffer)

    const HelveticaBold = await PDF.embedFont(StandardFonts.HelveticaBold)
    const Helvetica = await PDF.embedFont(StandardFonts.Helvetica)
    
    // Obtém a primeira página do PDF existente
    const existingPage = PDF.getPage(0);

    // Obtém as dimensões da página existente
    const { width, height } = existingPage.getSize();

    var Pagina = PDF.addPage([width, 840])

    const dataUTC = new Date(Documento.createdAt);

    // Opções para formatação no fuso horário do Brasil (Horário de Brasília)
    const opcoesFormatacao = {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Formato 24h
    };
    
    // Formata a data e hora
    const dataFormatada = dataUTC.toLocaleString('pt-BR', opcoesFormatacao);

    await ConstruirCabecalho(
        PDF, 
        Pagina, 
        Helvetica, 
        HelveticaBold,
        Documento.DocumentoTitulo,
        Documento.DocumentoToken, 
        Documento.DocumentoHashDoPDFOriginal,
        Documento.DocumentoLinkAutenticacao,
        dataFormatada
    )

    const { PaginaAtual, PosicaoY } = await ConstruirCorpo(
        PDF, 
        Pagina, 
        Helvetica, 
        HelveticaBold,
        Signatarios,
        Documento.DocumentoColecaoDeDivArrastavel
    )
   
    await ConstruirRodaPe(
        PDF, 
        PaginaAtual, 
        PosicaoY, 
        Helvetica, 
        HelveticaBold, 
        Documento.DocumentoToken
    ) 

    if (selfie) {
        let pdfKitDoc = new NewPDFDocument();
        let buffers = []; 

        pdfKitDoc.on('data', buffers.push.bind(buffers))
        pdfKitDoc.font('Helvetica-Bold').fontSize(20).text('Selfies dos Assinantes Verificados.', 27, 27)
        pdfKitDoc.strokeColor('#c7c7c7');
        pdfKitDoc.moveTo(27, 55).lineTo(570, 55).stroke()

        const pdfKitBufferPromise = new Promise((resolve, reject) => {
            pdfKitDoc.on('end', () => {
                resolve(Buffer.concat(buffers)); 
            });
        });

        let posicao = 0
        let paginaFoto = null

        for (let i = 0; i < Signatarios.length; i++) {  

            if (Signatarios[i].SignatarioSelfieBase64 != '') {

                pdfKitDoc.lineWidth(0.1)
                pdfKitDoc.moveTo(27, 100+posicao).lineTo(570, 100+posicao).stroke()
                pdfKitDoc.moveTo(27, 100+posicao).lineTo(27, 280+posicao).stroke()
                pdfKitDoc.moveTo(285, 100+posicao).lineTo(285, 280+posicao).stroke()
                pdfKitDoc.moveTo(570, 100+posicao).lineTo(570, 280+posicao).stroke()
                pdfKitDoc.moveTo(27, 280+posicao).lineTo(570, 280+posicao).stroke()

                pdfKitDoc.font('Helvetica').fontSize(10).text('Foto do rosto de '+Signatarios[i].SignatarioNome, 300, 120+posicao)
                pdfKitDoc.font('Helvetica').fontSize(10).text(Signatarios[i].SignatarioDataAssinatura, 300, 140+posicao)
                pdfKitDoc.font('Helvetica').fontSize(10).text('Token: '+Signatarios[i].SignatarioLinkToken, 300, 160+posicao)

                const imgBuffer = Buffer.from(Signatarios[i].SignatarioSelfieBase64.split(',')[1], 'base64')
                const dimensoesDaImagem = sizeOf(imgBuffer); 
 
                // se for selfie 
                if ((dimensoesDaImagem.height > dimensoesDaImagem.width) || (dimensoesDaImagem.height < dimensoesDaImagem.width && dimensoesDaImagem.orientation == 6)) {
                    pdfKitDoc.image(imgBuffer, 100, 115+posicao, { height: 150 })
                } else { // se for paisagem
                    pdfKitDoc.image(imgBuffer, 60, 115+posicao, { height: 110 })
                }

                // Define a opacidade da marca d'água
                pdfKitDoc.opacity(0.3); 

                // Define a fonte, tamanho e cor do texto da marca d'água
                pdfKitDoc.font('Helvetica-Bold').fontSize(30)
                pdfKitDoc.text('CONFIDENCIAL', 40, 170+posicao);
                pdfKitDoc.opacity(1);

                posicao = posicao + 200

                if (posicao == 600) {
                    posicao = 0
                }
            }

        }

        pdfKitDoc.end()     

        // Espera até que o pdf-kit finalize o documento
        const pdfKitBuffer = await pdfKitBufferPromise;

        // Carrega a nova página criada com pdf-kit
        const newPagePdfDoc = await PDFDocument.load(pdfKitBuffer);
        [paginaFoto] = await PDF.copyPages(newPagePdfDoc, [0]);

        // Adiciona a nova página ao PDF existente
        PDF.addPage(paginaFoto);
    }
    
    return await PDF.save();
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
    
    Pagina.drawText('Relatório de Assinaturas', {
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

/**
 * @async
 * @function ConstruirCorpo
 * @param {<import('pdf-lib').PDFDocument>} PDF 
 * @param {<import('pdf-lib').PDFPage>} Pagina  
 * @param {<import('pdf-lib').PDFFont>} Helvetica  
 * @param {<import('pdf-lib').PDFFont>} HelveticaBold  
 * @param {object} Signatarios  
*/
async function ConstruirCorpo(PDF, Pagina, Helvetica, HelveticaBold, Signatarios, ColecaoDeDivArrastavel) {

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

    for (let i = 0; i < Signatarios.length; i++) {

        let Signatario = Signatarios[i]

        const BufferAssinaturaPendente = fs.readFileSync(process.env.BaseDir+'/Arquivos/Permanente/pendente.png')
        const AssinaturaPendentePNG = await PDF.embedPng(BufferAssinaturaPendente)

        const BufferAssinaturaAssinada = fs.readFileSync(process.env.BaseDir+'/Arquivos/Permanente/assinado.png')
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

        if (Signatario.SignatarioAssinou == true) {
            const divArrastavel = ColecaoDeDivArrastavel.find(div => div.GUID === Signatario.SignatarioTokenLinkAssinatura)
            const bufferAssinaturaEscrita = Buffer.from(Signatario.SignatarioAssinaturaEscritaBase64.replace(/^data:image\/png;base64,/, ""), 'base64');
            const pngAssinaturaEscrita = await PDF.embedPng(bufferAssinaturaEscrita);
            const PaginaAssinatura = PDF.getPage(0)

            const novoLargura = 200
            const novoAltura = (novoLargura * pngAssinaturaEscrita.height) / pngAssinaturaEscrita.width

            PaginaAssinatura.drawImage(pngAssinaturaEscrita, {
                x: divArrastavel.x - 5,
                y: (PaginaAssinatura.getHeight() - divArrastavel.y) - 50,
                width: novoLargura,
                height: novoAltura,
                blendMode: 'Overlay'
            })

            PaginaAtual.drawImage(AssinadoPNG, {
                x: 25,
                y: PosicaoY-7,
                width: 16,
                height: 16,
            })

            PaginaAtual.drawText('Documento assinado como '+Signatario.SignatarioQualificacao, {
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

            PaginaAtual.drawText('IP: '+Signatario.SignatarioIp, {
                x: 47,
                y: PosicaoY-10,
                size: 7,
                font: Helvetica,
                color: rgb(0.46,0.46,0.46)
            })   

            if (Signatario.SignatarioGeolocalizacao) {
                PosicaoY = PosicaoY-10
        
                PaginaAtual.drawText('Localização aproximada: '+ Signatario.SignatarioGeolocalizacao.coordinates, {
                    x: 47,
                    y: PosicaoY-10,
                    size: 7,
                    font: Helvetica,
                    color: rgb(0.46,0.46,0.46)
                })  
            }             

            PosicaoY = PosicaoY-10

            PaginaAtual.drawText('Dispositivo: '+Signatario.SignatarioDispositivo, {
                x: 47,
                y: PosicaoY-10,
                size: 7,
                font: Helvetica,
                color: rgb(0.46,0.46,0.46)
            })  

            PosicaoY = PosicaoY-10

            const dataUTC = new Date(Signatario.updatedAt);

            // Opções para formatação no fuso horário do Brasil (Horário de Brasília)
            const opcoesFormatacao = {
              timeZone: 'America/Sao_Paulo',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false // Formato 24h
            };
            
            // Formata a data e hora
            const dataFormatada = dataUTC.toLocaleString('pt-BR', opcoesFormatacao);

            PaginaAtual.drawText('Assinado em '+dataFormatada, {
                x: 47,
                y: PosicaoY-10,
                size: 7,
                font: Helvetica,
                color: rgb(0.46,0.46,0.46)
            }) 

            PosicaoY = PosicaoY-10

            if (Signatario.SignatarioFormaAutenticacao === 'email') {
                PaginaAtual.drawText('Email: '+Signatario.SignatarioEmail+' (autenticado com código enviado exclusivamente a este e-mail)', {
                    x: 47,
                    y: PosicaoY-10,
                    size: 7,
                    font: Helvetica,
                    color: rgb(0.46,0.46,0.46)
                })
        
                PosicaoY = PosicaoY-10
        
                PaginaAtual.drawText('Celular: '+Signatario.SignatarioTokenWhatsApp, {
                    x: 47,
                    y: PosicaoY-10,
                    size: 7,
                    font: Helvetica,
                    color: rgb(0.46,0.46,0.46)
                })         
            } else {
                PaginaAtual.drawText('Email: '+Signatario.SignatarioEmail, {
                    x: 47,
                    y: PosicaoY-10,
                    size: 7,
                    font: Helvetica,
                    color: rgb(0.46,0.46,0.46)
                })
        
                PosicaoY = PosicaoY-10
        
                PaginaAtual.drawText('Celular: '+Signatario.SignatarioTokenWhatsApp+' (autenticado com código enviado exclusivamente a este WhatsApp)', {
                    x: 47,
                    y: PosicaoY-10,
                    size: 7,
                    font: Helvetica,
                    color: rgb(0.46,0.46,0.46)
                }) 
            }

            PosicaoY = PosicaoY-50

        } else {

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

        }

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