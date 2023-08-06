const { DocumentoExtra, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async ({params: { DocumentoExtraId } }, Resposta) => {

    const { dataValues: { ArquivoOriginalId: ArquivoId } } = await DocumentoExtra.findOne({
        where: { DocumentoExtraId },
        attributes: ["ArquivoOriginalId"]
    })

    ArquivoBase64 = await Arquivo.findOne({
        where: { ArquivoId },
        attributes: ["ArquivoId","ArquivoBase64"]        
    })

    Resposta.json(ArquivoBase64)
}