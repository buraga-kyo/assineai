const GCR_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/GCR_ConstruirPaginaComDadosDeAssinatura")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidarComAssinatura/CertificadoDigital")
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")
const fs = require("fs")

module.exports = async (Requisicao, Resposta) => {

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

    DadosDoPDFAssinado = {}
    DadosDoPDFAssinado.ChavePublica = DadosCriptografiaAssimetrica.ChavePublica
    DadosDoPDFAssinado.Assinatura = DadosCriptografiaAssimetrica.Assinatura
    DadosDoPDFAssinado.Base64 = Base64PDFComCertificado

    Resposta.json(DadosDoPDFAssinado)
}