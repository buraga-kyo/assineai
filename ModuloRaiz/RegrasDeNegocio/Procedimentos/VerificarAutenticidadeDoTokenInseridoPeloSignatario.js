const { Signatario } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {

    let SignatarioTokenEnviadoEmail = await Signatario.findOne({
        where: { SignatarioToken: Requisicao.body.SignatarioToken, SignatarioTokenEnviadoEmail: Requisicao.body.SignatarioTokenEnviadoEmail },
        attributes: ["SignatarioTokenEnviadoEmail"]
    })

    Resposta.json(SignatarioTokenEnviadoEmail?.dataValues || 'EsseTokenNãoÉAutêntico')

}