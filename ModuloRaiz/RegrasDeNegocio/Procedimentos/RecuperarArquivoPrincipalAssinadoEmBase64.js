const { Documento, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async ({params: { DocumentoId } }, Resposta) => {

    const { dataValues: { ArquivoAssinadoId: ArquivoId } } = await Documento.findOne({
        where: { DocumentoId },
        attributes: ["ArquivoAssinadoId"]
    })

    ArquivoBase64 = await Arquivo.findOne({
        where: { ArquivoId },
        attributes: ["ArquivoId","ArquivoBase64"]        
    })

    Resposta.json(ArquivoBase64)
}