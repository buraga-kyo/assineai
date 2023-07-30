const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas
const RecuperarHashDeArquivoApartirDeBase64 = require("../Ferramentas/FuncoesGenericas/RecuperarHashDeArquivoApartirDeBase64")
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const crypto = require("crypto")

module.exports = async (Requisicao, Resposta) => {
    
    try {

        let DocumentoToken = crypto.randomUUID()

        let ArquivoBase64 = Requisicao.body.DocumentoBase64
        let CaminhoDoPDF = "./Arquivos/Temporario/"+DocumentoToken+"_Original.pdf"
        await CriarArquivoPDFApartirDoBase64(CaminhoDoPDF, ArquivoBase64)
        const HashDoPDFOriginal = await RecuperarHashDeArquivoApartirDeBase64(CaminhoDoPDF)

        const RegistroArquivo = { ArquivoBase64 }
        const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        const RegistroDoDocumento = {
            DocumentoTitulo: Requisicao.body.DocumentoTitulo,
            DocumentoNome: Requisicao.body.DocumentoNome,
            DocumentoToken,
            DocumentoHashDoPDFOriginal: HashDoPDFOriginal,
            ArquivoOriginalId: ArquivoId,
            DocumentoStatusAssinatura: "Em Processo",
            DocumentoResponsavel: Requisicao.body.DocumentoResponsavel
        }
        const { DocumentoId } = await Documento.create(RegistroDoDocumento)

        const ColecaoDeSignatarios = Requisicao.body.Signatarios.map((RegistroDoSignatario) => {
            let SignatarioToken = crypto.randomUUID()
            
            return {
                ...RegistroDoSignatario,
                SignatarioToken,
                DocumentoId: DocumentoId,
                SignatarioStatusAssinatura: "Pendente",
                SignatarioLinkAssinatura: process.env.ORIGIN+'/verificar/'+SignatarioToken
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