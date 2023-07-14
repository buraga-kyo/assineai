const { Documento, DocumentoExtra, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const crypto = require("crypto");

module.exports = async (Requisicao, Resposta) => {
    
    try {

        const { dataValues: { DocumentoId } } = await Documento.findOne({ where: { DocumentoToken: Requisicao.params.DocumentoToken } })

        const RegistroArquivo = {
            ArquivoBase64: Requisicao.body.DocumentoBase64,
        }
        const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        const RegistroDoDocumentoExtra = {
            DocumentoExtraNome: Requisicao.body.DocumentoNome,
            DocumentoExtraToken: crypto.randomUUID(),
            ArquivoOriginalId: ArquivoId,
            DocumentoId
        }
        
        await DocumentoExtra.create(RegistroDoDocumentoExtra)
        
        Resposta.json(RegistroDoDocumentoExtra)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}