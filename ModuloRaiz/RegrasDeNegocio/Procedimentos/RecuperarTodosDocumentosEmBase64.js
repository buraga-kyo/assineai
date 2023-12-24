const { Documento, DocumentoExtra, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async ({params: { DocumentoId } }, Resposta) => {

    // let Documentos = await Arquivo.findAndCountAll({
    //     where: { 'DocumentoId': DocumentoId },
    //     attributes: [ "DocumentoId", "DocumentoNome", "DocumentoStatusAssinatura", "DocumentoToken", "DocumentoDataDeGeracao"],
    //     include: [
    //       {model: Signatario, as: 'Signatarios', attributes: ['SignatarioNome']},
    //       {model: DocumentoExtra, as: 'DocumentosExtras', attributes: ['DocumentoExtraId']}
    //     ],
    //     order: Order
    // })

    // const { dataValues: { ArquivoOriginalId: ArquivoId } } = await Documento.findOne({
    //     where: { DocumentoId },
    //     attributes: ["ArquivoOriginalId"]
    // })

    // ArquivoBase64 = await Arquivo.findOne({
    //     where: { ArquivoId },
    //     attributes: ["ArquivoId","ArquivoBase64"]        
    // })

    // Resposta.json(ArquivoBase64)
}