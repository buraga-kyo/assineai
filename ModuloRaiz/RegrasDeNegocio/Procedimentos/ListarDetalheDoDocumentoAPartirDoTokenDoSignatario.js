const { Documento, Signatario, DocumentoExtra } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {

    try {

        let RegistrosDoDocumento = await Signatario.findOne({
            where: { SignatarioToken: Requisicao.params.SignatarioToken },
            attributes: ['SignatarioId'],
            include: [
                {
                    model: Documento, 
                    as: 'Documentos', 
                    attributes: ['DocumentoId', 'DocumentoNome']
                }
            ]
        })

        let RegistrosDocumentosExtras = await DocumentoExtra.findAll({
            where: { DocumentoId: RegistrosDoDocumento.dataValues.Documentos.dataValues.DocumentoId }
        })

        RegistrosDoDocumento.dataValues.DocumentoExtra = RegistrosDocumentosExtras

        Resposta.json(RegistrosDoDocumento)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }


}