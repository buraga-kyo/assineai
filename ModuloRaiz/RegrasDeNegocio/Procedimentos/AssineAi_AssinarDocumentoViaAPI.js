const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;
const AssineAi_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/AssineAi_ConstruirPaginaComDadosDeAssinatura")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const AssinarPDFcomCertificadoDigital = require("../Ferramentas/LidarComAssinatura/CertificadoDigital")
const AssinarPDFcomCriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")
const fs = require("fs");
const { raw } = require("body-parser");

module.exports = async (Requisicao, Resposta) => {

    try {

        const signatario = await Signatarios.findOne({
            raw: true,
            where: {
                SignatarioTokenLinkAssinatura: Requisicao.body.SignatarioToken
            },
            attributes: ["AssinaturaId"]
        });

        const signatarios = await Signatarios.findAll({
            raw: true,
            where: {
                AssinaturaId: signatario.AssinaturaId
            }
        });

        const documentos = await Documentos.findAll({
            raw: true,
            where: {
                AssinaturaId: signatario.AssinaturaId
            }
        });

        const ColecaoDeDocumentos = []
        var DocumentoBase64Atualizado = ""
        var NomeDoArquivo = ""
        var CaminhoDoArquivo = ""
        var ArquivoPDFCriadoComSucesso = false

        for await (const documento of documentos) {

            NomeDoArquivo = documento.DocumentoHashDoPDFOriginal + ".pdf"
            const buffer = await AssineAi_ConstruirPaginaComDadosDeAssinatura(documento, signatarios, false)
            CaminhoDoArquivo = process.env.BaseDir + "/Arquivos/Temporario/" + NomeDoArquivo
            
            fs.writeFile(CaminhoDoArquivo, buffer, (err) => {
                if (err) throw err;
                console.log('Arquivo PDF salvo com sucesso! no caminho: ' + CaminhoDoArquivo);
            });


            /*ArquivoPDFCriadoComSucesso = await CriarArquivoPDFApartirDoBase64(CaminhoDoArquivo, DocumentoBase64Atualizado)

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
            })*/
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