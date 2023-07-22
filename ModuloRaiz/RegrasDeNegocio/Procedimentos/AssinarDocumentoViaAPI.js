const { Signatario, Documento, Arquivo } = require("../../BancoDeDados/Conector").Tabelas
const DataAtualFormatada = require("../Ferramentas/FuncoesGenericas/DataAtualFormatada")
const ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/ConstruirPaginaComDadosDeAssinaturaProducao")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidadorDeAssinatura/CertificadoDigital")
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidadorDeAssinatura/CriptografiaAssimetrica")

const fs = require("fs");


module.exports = async (Requisicao, Resposta) => {
    const { dataValues: RegistrosDoSignatario } = await Signatario.findOne({ where: { SignatarioToken: Requisicao.body.SignatarioToken } })
    const { dataValues: RegistrosDoDocumento } = await Documento.findOne({ where: { DocumentoId: RegistrosDoSignatario.DocumentoId } })

    RegistrosDoSignatario.SignatarioIp = Requisicao.connection.remoteAddress || Requisicao.socket.remoteAddress || Requisicao.connection.socket.remoteAddress
    
    RegistrosDoSignatario.SignatarioDispositivo = Requisicao.headers['user-agent']
    RegistrosDoSignatario.SignatarioDataAssinatura = DataAtualFormatada()
    RegistrosDoSignatario.SignatarioStatusAssinatura = "assinado"
    Signatario.update(RegistrosDoSignatario, { where: { SignatarioId: RegistrosDoSignatario.SignatarioId } })    
    Documento.update({ DocumentoStatusAssinatura: "Em Processo" }, { where: { DocumentoId: RegistrosDoSignatario.DocumentoId } })

    const DocumentoBase64Atualizado = await ConstruirPaginaComDadosDeAssinatura(RegistrosDoDocumento.DocumentoId, RegistrosDoSignatario.SignatarioId)

    const NomeDoArquivo = RegistrosDoDocumento.DocumentoId+".pdf"
    const CaminhoDoArquivo = "./Arquivos/Temporario/"+NomeDoArquivo

    const ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)

    if (ArquivoPDFCriadoComSucesso) {
        const PDFAssinadoComSucesso = await AssinarPDFcomCertificadoDigital(NomeDoArquivo)

        if (PDFAssinadoComSucesso) {
            const BufferDoPDFcomCertificado =  fs.readFileSync("./Arquivos/Temporario/"+RegistrosDoDocumento.DocumentoId+"_signed.pdf")
            const Base64PDFComCertificado = BufferDoPDFcomCertificado.toString('base64')
            const DadosCriptografiaAssimetrica = AssinarPDFcomCriptografiaAssimetrica(Base64PDFComCertificado)

            const { ArquivoId } = await Arquivo.create({ ArquivoBase64: Base64PDFComCertificado })

            Documento.update({
                DocumentoChaveAssinatura: DadosCriptografiaAssimetrica.Assinatura,
                DocumentoChavePublica: DadosCriptografiaAssimetrica.ChavePublica,
                ArquivoAssinadoId: ArquivoId,
            }, {
                where: {
                    DocumentoId: RegistrosDoDocumento.DocumentoId
                }
            })

        }

    }   

    Resposta.sendStatus(200)
}