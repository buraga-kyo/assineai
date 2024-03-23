const GCR_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/GCR_ConstruirPaginaComDadosDeAssinatura")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidarComAssinatura/CertificadoDigital")
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")
const fs = require("fs")

module.exports = async (Requisicao, Resposta) => {

    try {

        //throw new Error('Falha ao buscar dados da API')

        const DadosDeAssinatura = Requisicao.body
        DadosDeAssinatura.SignatarioIp = Requisicao.connection.remoteAddress || Requisicao.socket.remoteAddress || Requisicao.connection.socket.remoteAddress
        DadosDeAssinatura.SignatarioDispositivo = Requisicao.headers['user-agent']
    
        const DocumentoBase64Atualizado = await GCR_ConstruirPaginaComDadosDeAssinatura(DadosDeAssinatura)
    
        const NomeDoArquivo = DadosDeAssinatura.DocumentoTitulo+".pdf"
        const CaminhoDoArquivo = "./Arquivos/Temporario/"+NomeDoArquivo
        const ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)
    
        if (ArquivoPDFCriadoComSucesso) {
    
            const PDFAssinadoComSucesso = await AssinarPDFcomCertificadoDigital(NomeDoArquivo)
    
            if (PDFAssinadoComSucesso) {
                const BufferDoPDFcomCertificado =  fs.readFileSync("./Arquivos/Temporario/"+DadosDeAssinatura.DocumentoTitulo+"_signed.pdf")
                var Base64PDFComCertificado = BufferDoPDFcomCertificado.toString('base64')
                var DadosCriptografiaAssimetrica = AssinarPDFcomCriptografiaAssimetrica(Base64PDFComCertificado)
            }  
    
        }
    
        const DadosDoPDFAssinado = {}
        DadosDoPDFAssinado.ChavePublica = DadosCriptografiaAssimetrica.ChavePublica
        DadosDoPDFAssinado.Assinatura = DadosCriptografiaAssimetrica.Assinatura
        DadosDoPDFAssinado.Base64 = Base64PDFComCertificado
    
        Resposta.json(DadosDoPDFAssinado)

    } catch (error) {
        
        console.error('--------------------------------------------------------')
        console.error('Requisicao: ',Requisicao.body)
        console.error('***********************************************************************************')
        console.error('Erro: ',error)
        console.error('--------------------------------------------------------')

        Resposta.status(500).json(error)

    }

}