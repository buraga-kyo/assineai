const { Documento, Signatario, DocumentoExtra } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {

    try {

        let RegistrosDoDocumento = await Signatario.findAll({
            where: { SignatarioToken: Requisicao.params.SignatarioToken },
            include: [{model: Documento, as: 'Documentos', attributes: ['DocumentoId', 'DocumentoNome']}],
        })

        //console.log(RegistrosDoDocumento.dataValues.Documentos)

        // let DocumentoId = RegistrosDoDocumento.dataValues.DocumentoId

        // let RegistrosDosDocumentosExtras = await DocumentoExtra.findAll({ 
        //     where: { DocumentoId },
        //     attributes: [
        //         "DocumentoExtraId","DocumentoExtraNome"
        //     ]            
        // })

        // console.log(RegistrosDoDocumento)
        // console.log(RegistrosDosDocumentosExtras)

        Resposta.json(RegistrosDoDocumento)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }


}