const { Documento, DocumentoExtra, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const crypto = require("crypto");
const CriarArquivoPDFApartirDoBase64 = require("../Ferramentas/ManipulacaoDePDF/CriarArquivoPDFApartirDoBase64")
const RecuperarHashDeArquivoApartirDeBase64 = require("../Ferramentas/FuncoesGenericas/RecuperarHashDeArquivoApartirDeBase64")

module.exports = async (Requisicao, Resposta) => {
    
    try {

        const { dataValues: { DocumentoId } } = await Documento.findOne({ where: { DocumentoToken: Requisicao.params.DocumentoToken } })

        const RegistroArquivo = {
            ArquivoBase64: Requisicao.body.DocumentoBase64,
        }
        const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        let DocumentoExtraToken = crypto.randomUUID()
        let ArquivoBase64 = Requisicao.body.DocumentoBase64
        let CaminhoDoPDF = "./Arquivos/Temporario/"+DocumentoExtraToken+"_Original.pdf"
        await CriarArquivoPDFApartirDoBase64(CaminhoDoPDF, ArquivoBase64)
        const HashDoPDFOriginal = await RecuperarHashDeArquivoApartirDeBase64(CaminhoDoPDF)

        const RegistroDoDocumentoExtra = {
            DocumentoExtraNome: Requisicao.body.DocumentoNome,
            ArquivoOriginalId: ArquivoId,
            DocumentoExtraHashDoPDFOriginal: HashDoPDFOriginal,
            DocumentoExtraToken,
            DocumentoId
        }
        
        await DocumentoExtra.create(RegistroDoDocumentoExtra)
        
        Resposta.json(RegistroDoDocumentoExtra)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}

// const { Documento, DocumentoExtra, Arquivo } = require("../../BancoDeDados/Conector").Tabelas
// const crypto = require("crypto")
// const RecuperarHashDeArquivoApartirDeBase64 = require("../Ferramentas/FuncoesGenericas/RecuperarHashDeArquivoApartirDeBase64")

// module.exports = async (Requisicao, Resposta) => {
    
//     try {

//         const { dataValues: { DocumentoId } } = await DocumentoExtra.findOne({ where: { DocumentoExtraToken: Requisicao.params.DocumentoToken } })

//         let DocumentoToken = crypto.randomUUID()

//         let ArquivoBase64 = Requisicao.body.DocumentoBase64
//         let CaminhoDoPDF = "./Arquivos/Temporario/"+DocumentoToken+"_Original.pdf"
//         await CriarArquivoPDFApartirDoBase64(CaminhoDoPDF, ArquivoBase64)
//         const HashDoPDFOriginal = await RecuperarHashDeArquivoApartirDeBase64(CaminhoDoPDF)

//         const RegistroArquivo = {
//             ArquivoBase64: Requisicao.body.DocumentoBase64,
//         }
//         const { ArquivoId } = await Arquivo.create(RegistroArquivo)

//         const RegistroDoDocumentoExtra = {
//             DocumentoExtraNome: Requisicao.body.DocumentoNome,
//             DocumentoExtraToken: DocumentoToken,
//             ArquivoOriginalId: ArquivoId,
//             DocumentoExtraHashDoPDFOriginal: HashDoPDFOriginal,
//             DocumentoId
//         }
        
//         await DocumentoExtra.create(RegistroDoDocumentoExtra)
        
//         Resposta.json(RegistroDoDocumentoExtra)

//     } catch (Erro) {
//         console.log(Erro)
//         Resposta.sendStatus(500)
//     }

    
// }