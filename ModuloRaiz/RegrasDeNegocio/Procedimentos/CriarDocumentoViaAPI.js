const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const crypto = require("crypto");

module.exports = async (Requisicao, Resposta) => {
    
    try {

        const RegistroArquivo = {
            ArquivoBase64: Requisicao.body.DocumentoBase64,
        }
        const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        const RegistroDoDocumento = {
            DocumentoNome: Requisicao.body.DocumentoNome,
            DocumentoToken: crypto.randomUUID(),
            ArquivoOriginalId: ArquivoId
        }
        const { DocumentoId } = await Documento.create(RegistroDoDocumento)

        const ColecaoDeSignatarios = Requisicao.body.Signatarios.map((RegistroDoSignatario) => {
            return {
                ...RegistroDoSignatario,
                SignatarioToken: crypto.randomUUID(),
                DocumentoId: DocumentoId
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