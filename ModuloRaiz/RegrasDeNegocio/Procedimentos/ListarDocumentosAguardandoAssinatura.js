const { Documento, Signatario, DocumentoExtra } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {
    
    try {
        let RegistroSignatario = await Signatario.findOne({
            where: { SignatarioToken: Requisicao.params.SignatarioToken },
            attributes: ["DocumentoId"]
        })

        let RegistroDocumento = await Documento.findOne({
            where: { DocumentoId: RegistroSignatario.DocumentoId },
            attributes: ["DocumentoId", "DocumentoNome"]
        })      

        let RegistroDocumentoExtra = await DocumentoExtra.findAll({
            where: { DocumentoId: RegistroSignatario.DocumentoId },
            attributes: ["DocumentoId", "DocumentoExtraNome"]
        }) 
        
        const MapRegistroDocumentoExtra = RegistroDocumentoExtra.map(({dataValues}) => {
            return {
                ...dataValues
            }
        })

        let Registro = {}
        Registro.DocumentoExtra = [
            RegistroDocumento.dataValues,
            ...MapRegistroDocumentoExtra
        ]

        Resposta.json(Registro)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}