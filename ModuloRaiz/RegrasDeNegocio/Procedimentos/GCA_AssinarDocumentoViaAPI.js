const GCA_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/GCA_ConstruirPaginaComDadosDeAssinatura")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidarComAssinatura/CertificadoDigital")
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")
const fs = require("fs")

module.exports = async ({ body: { Documentos, Signatarios } }, Resposta) => {

    try {

        const ColecaoDeDocumentos = []
        var DocumentoBase64Atualizado = ""
        var NomeDoArquivo = ""
        var CaminhoDoArquivo = ""
        var ArquivoPDFCriadoComSucesso = false

        for await (const documento of Documentos) {

            NomeDoArquivo = documento.DocumentoToken+".pdf"
            DocumentoBase64Atualizado = await GCA_ConstruirPaginaComDadosDeAssinatura(documento, Signatarios)
            CaminhoDoArquivo = process.env.BaseDir+"/Arquivos/Temporario/"+NomeDoArquivo
            ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)

            if (ArquivoPDFCriadoComSucesso) {
        
                const PDFAssinadoComSucesso = await AssinarPDFcomCertificadoDigital(NomeDoArquivo)
        
                if (PDFAssinadoComSucesso) {
                    const BufferDoPDFcomCertificado =  fs.readFileSync(process.env.BaseDir+"/Arquivos/Temporario/"+documento.DocumentoToken+"_signed.pdf")
                    var Base64PDFComCertificado = BufferDoPDFcomCertificado.toString('base64')
                    var DadosCriptografiaAssimetrica = AssinarPDFcomCriptografiaAssimetrica(Base64PDFComCertificado)
                } else {
                    console.log('Ocorreu um erro na assinatura do pdf com certificado')
                    return Resposta.status(500).json('Ocorreu um erro na assinatura do pdf com certificado')
                }
        
            } else {
                console.log('Ocorreu um erro na criação do arquivo fisico')
                return Resposta.status(500).json('Ocorreu um erro na assinatura do pdf com certificado')
            }

            ColecaoDeDocumentos.push({
                DocumentoToken: documento.DocumentoToken,
                DocumentoBase64Atualizado: Base64PDFComCertificado,
                ChavePublica: DadosCriptografiaAssimetrica.ChavePublica,
                Assinatura: DadosCriptografiaAssimetrica.Assinatura
            })
        }

        Resposta.json(ColecaoDeDocumentos)

    } catch (error) {
            
        console.error('-----------------------------------------------------------------------------------')
        console.error('***********************************************************************************')
        console.error('Erro: ',error)
        console.error('-----------------------------------------------------------------------------------')

        Resposta.status(500).json(error)

    }

}

// module.exports = async ({ body: { Documentos, Signatarios } }, Resposta) => {

//     const ColecaoDeDocumentos = []
//     var DocumentoBase64Atualizado = ""
//     var NomeDoArquivo = ""
//     var CaminhoDoArquivo = ""
//     var ArquivoPDFCriadoComSucesso = false

//     for await (const documento of Documentos) {

//         // DocumentoBase64Atualizado = await GCA_ConstruirPaginaComDadosDeAssinatura(documento, Signatarios)
//         // NomeDoArquivo = documento.DocumentoTitulo+".pdf"
//         // CaminhoDoArquivo = process.env.BaseDir+"/Arquivos/Temporario/"+NomeDoArquivo
//         // ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)

//         ColecaoDeDocumentos.push({
//             DocumentoToken: documento.DocumentoToken,
//             DocumentoBase64Atualizado: await GCA_ConstruirPaginaComDadosDeAssinatura(documento, Signatarios),
//         })
//     }

//     console.log("ColecaoDeDocumentos",ColecaoDeDocumentos);

//     Resposta.json(ColecaoDeDocumentos)
  
// }


    // const { dataValues: RegistrosDoSignatario } = await Signatario.findOne({ where: { SignatarioToken: Requisicao.body.SignatarioToken } })
    // const { dataValues: RegistrosDoDocumento } = await Documento.findOne({ where: { DocumentoId: RegistrosDoSignatario.DocumentoId } })

    // RegistrosDoSignatario.SignatarioIp = Requisicao.connection.remoteAddress || Requisicao.socket.remoteAddress || Requisicao.connection.socket.remoteAddress
    // RegistrosDoSignatario.SignatarioDispositivo = Requisicao.headers['user-agent']
    // RegistrosDoSignatario.SignatarioDataAssinatura = DataAtualFormatada()
    // RegistrosDoSignatario.SignatarioStatusAssinatura = "Assinado"
    
    // Signatario.update(RegistrosDoSignatario, { where: { SignatarioId: RegistrosDoSignatario.SignatarioId } })    
    // Documento.update({ DocumentoStatusAssinatura: "Em Processo" }, { where: { DocumentoId: RegistrosDoSignatario.DocumentoId } })

    // const DocumentoBase64Atualizado = await ConstruirPaginaComDadosDeAssinatura(RegistrosDoDocumento.DocumentoId, RegistrosDoSignatario.SignatarioId)

    // const NomeDoArquivo = RegistrosDoDocumento.DocumentoId+".pdf"
    // const CaminhoDoArquivo = "./Arquivos/Temporario/"+NomeDoArquivo

    // const ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)

    // if (ArquivoPDFCriadoComSucesso) {
        // const PDFAssinadoComSucesso = await AssinarPDFcomCertificadoDigital(NomeDoArquivo)

    //     if (PDFAssinadoComSucesso) {
    //         const BufferDoPDFcomCertificado =  fs.readFileSync("./Arquivos/Temporario/"+RegistrosDoDocumento.DocumentoId+"_signed.pdf")
    //         const Base64PDFComCertificado = BufferDoPDFcomCertificado.toString('base64')
    //         const DadosCriptografiaAssimetrica = AssinarPDFcomCriptografiaAssimetrica(Base64PDFComCertificado)

    //         const { ArquivoId } = await Arquivo.create({ ArquivoBase64: Base64PDFComCertificado })

    //         const TotalDeSignatarios = await Signatario.count({ 
    //             where: { DocumentoId: RegistrosDoSignatario.DocumentoId } 
    //         })
    
    //         const TotalDeAssinaturas = await Signatario.count({ 
    //             where: { SignatarioStatusAssinatura: 'Assinado', DocumentoId: RegistrosDoSignatario.DocumentoId } 
    //         })

    //         const Data = new Date();
    
    //         let Mensagem = 'Assinou em '+Data.toLocaleString('pt-BR');        

    //         //new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
            
    //         Signatario.update({ 
    //             SignatarioMensagemSobreVisualizacaoDoLinkDeAssinatura: Mensagem,
    //             SignatarioStatusAssinatura: 'Assinado',
    //          }, { where: { SignatarioToken: Requisicao.body.SignatarioToken } })

    //         Documento.update({
    //             DocumentoChaveAssinatura: DadosCriptografiaAssimetrica.Assinatura,
    //             DocumentoChavePublica: DadosCriptografiaAssimetrica.ChavePublica,
    //             ArquivoAssinadoId: ArquivoId,
    //             DocumentoStatusAssinatura: (TotalDeSignatarios == TotalDeAssinaturas ? 'Assinado' : 'Em Processo')
    //         }, {
    //             where: {
    //                 DocumentoId: RegistrosDoDocumento.DocumentoId
    //             }
    //         })

    //     }
    // }   

    // const RegistrosDosDocumentosExtras = await DocumentoExtra.findAll({ where: { DocumentoId: RegistrosDoSignatario.DocumentoId } })

    // for await (let Registros of RegistrosDosDocumentosExtras) {

    //     const DocumentoBase64Atualizado = await ConstruirPaginaDocumentoExtraComDadosDeAssinaturaProducao(
    //         Registros.DocumentoExtraId, RegistrosDoSignatario.SignatarioId
    //     )

    //     const NomeDoArquivo = Registros.DocumentoExtraId+".pdf"
    //     const CaminhoDoArquivo = "./Arquivos/Temporario/"+NomeDoArquivo
    
    //     const ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)
    
    //     if (ArquivoPDFCriadoComSucesso) {
    //         const PDFAssinadoComSucesso = await AssinarPDFcomCertificadoDigital(NomeDoArquivo)
    
    //         if (PDFAssinadoComSucesso) {
    //             const BufferDoPDFcomCertificado =  fs.readFileSync("./Arquivos/Temporario/"+Registros.DocumentoExtraId+"_signed.pdf")
    //             const Base64PDFComCertificado = BufferDoPDFcomCertificado.toString('base64')
    //             const DadosCriptografiaAssimetrica = AssinarPDFcomCriptografiaAssimetrica(Base64PDFComCertificado)
    
    //             const { ArquivoId } = await Arquivo.create({ ArquivoBase64: Base64PDFComCertificado })
                
    //             console.log(ArquivoId)

    //             DocumentoExtra.update({
    //                 DocumentoExtraChaveAssinatura: DadosCriptografiaAssimetrica.Assinatura,
    //                 DocumentoExtraChavePublica: DadosCriptografiaAssimetrica.ChavePublica,
    //                 ArquivoAssinadoId: ArquivoId,
    //             }, {
    //                 where: {
    //                     DocumentoId: RegistrosDoDocumento.DocumentoId
    //                 }
    //             })
    
    //         }
    //     }   
    // }

