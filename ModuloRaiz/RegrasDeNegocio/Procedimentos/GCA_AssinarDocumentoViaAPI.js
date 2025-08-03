const GCA_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/GCA_ConstruirPaginaComDadosDeAssinatura")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidarComAssinatura/CertificadoDigital")
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")
const fs = require("fs")

module.exports = async ({ body: { Documentos, Signatarios, GravarSelfie } }, Resposta) => {

    try {     

        const ColecaoDeDocumentos = []
        var DocumentoBase64Atualizado = ""
        var NomeDoArquivo = ""
        var CaminhoDoArquivo = ""
        var ArquivoPDFCriadoComSucesso = false

        for await (const documento of Documentos) {

            NomeDoArquivo = documento.DocumentoToken+".pdf"
            DocumentoBase64Atualizado = await GCA_ConstruirPaginaComDadosDeAssinatura(documento, Signatarios, GravarSelfie)
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

        Resposta.status(200).json(ColecaoDeDocumentos)

    } catch (error) {
            
        console.error('-----------------------------------------------------------------------------------')
        console.error('***********************************************************************************')
        console.error(error)
        console.error('-----------------------------------------------------------------------------------')

        Resposta.status(500).json(error)

    }

}