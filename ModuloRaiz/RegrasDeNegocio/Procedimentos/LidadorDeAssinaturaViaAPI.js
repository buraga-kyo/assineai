const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;

const ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/ConstruirPaginaComDadosDeAssinatura");
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64");
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidadorDeAssinatura/CertificadoDigital");
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidadorDeAssinatura/CriptografiaAssimetrica");

const fs = require("fs");
const crypto = require("crypto");

module.exports = async (Requisicao, Resposta, ProximaFuncao) => {
    
    try {
        const RegistroArquivo = {
            ArquivoBase64: Requisicao.body.DocumentoBase64,
        }
        const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        const RegistroDoDocumento = {
            DocumentoNome: Requisicao.body.DocumentoNome,
            DocumentoGUID: crypto.randomUUID(),
            ArquivoOriginalId: ArquivoId
        }
        const { DocumentoId } = await Documento.create(RegistroDoDocumento)

        const RegistroDoSignatario = {
            SignatarioNome: Requisicao.body.SignatarioNome,
            SignatarioEmail: Requisicao.body.SignatarioEmail,
            SignatarioModoAutenticacao: Requisicao.body.SignatarioModoAutenticacao,
            SignatarioIp: Requisicao.connection.remoteAddress || Requisicao.socket.remoteAddress || Requisicao.connection.socket.remoteAddress,
            SignatarioDispositivo: JSON.stringify(Requisicao.headers),
            SignatarioToken: Requisicao.body.SignatarioToken,
            DocumentoId
        }; 
        Signatario.create(RegistroDoSignatario)

        const DocumentoBase64Atualizado = await ConstruirPaginaComDadosDeAssinatura(RegistroArquivo.ArquivoBase64, DocumentoId)

        const NomeDoArquivo = DocumentoId+".pdf"
        const CaminhoDoArquivo = "./ArquivosTemporarios/"+NomeDoArquivo

        const ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)

        if (ArquivoPDFCriadoComSucesso) {
            const PDFAssinadoComSucesso = await AssinarPDFcomCertificadoDigital(NomeDoArquivo)

            if (PDFAssinadoComSucesso) {
                console.log("entrou")
                const BufferDoPDFcomCertificado =  fs.readFileSync("./ArquivosTemporarios/"+DocumentoId+"_signed.pdf")
                const Base64PDFComCertificado = BufferDoPDFcomCertificado.toString('base64')
                const DadosCriptografiaAssimetrica = AssinarPDFcomCriptografiaAssimetrica(Base64PDFComCertificado)

                const { ArquivoId } = await Arquivo.create({ ArquivoBase64: Base64PDFComCertificado })

                Documento.update({
                    DocumentoChaveAssinatura: DadosCriptografiaAssimetrica.Assinatura,
                    DocumentoChavePublica: DadosCriptografiaAssimetrica.ChavePublica,
                    ArquivoAssinadoId: ArquivoId,
                }, {
                    where: {
                        DocumentoId
                    }
                })

            }

        }   
    } catch (Erro) {
        console.log(Erro)
    }

    Resposta.sendStatus(200)
    
}