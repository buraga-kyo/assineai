const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas
const RecuperarHashDeArquivoApartirDeBase64 = require("../Ferramentas/FuncoesGenericas/RecuperarHashDeArquivoApartirDeBase64")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const crypto = require("crypto")

module.exports = async (Requisicao, Resposta) => {
    
    try {

        let ArquivoBase64 = Requisicao.body.DocumentoBase64
        let DocumentoToken = crypto.randomUUID()
        let CaminhoDoPDF = "./Arquivos/Temporario/"+DocumentoToken+"_Original.pdf"
        await CriarArquivoPDFApartirDoBase64(CaminhoDoPDF, ArquivoBase64)
        const HashDoPDFOriginal = await RecuperarHashDeArquivoApartirDeBase64(CaminhoDoPDF)

        const RegistroArquivo = { ArquivoBase64 }
        const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        const RegistroDoDocumento = {
            DocumentoTitulo:  Requisicao.body.DocumentoTitulo,
            DocumentoNome: Requisicao.body.DocumentoNome,
            DocumentoToken,
            DocumentoHashDoPDFOriginal: HashDoPDFOriginal,
            ArquivoOriginalId: ArquivoId,
            DocumentoStatusAssinatura: "Em Processo"
        }
        const { DocumentoId } = await Documento.create(RegistroDoDocumento)

        const ColecaoDeSignatarios = Requisicao.body.Signatarios.map((RegistroDoSignatario) => {
            return {
                ...RegistroDoSignatario,
                SignatarioToken: crypto.randomUUID(),
                DocumentoId: DocumentoId,
                SignatarioStatusAssinatura: "Pendente"
            }
        })

        ColecaoDeSignatarios.forEach((RegistroDoSignatario) => {
            Signatario.create(RegistroDoSignatario)
        })

        const JSONResposta = {
            Documento: RegistroDoDocumento,
            Signatarios: ColecaoDeSignatarios 
        }

        Resposta.json(JSONResposta)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}