const { Signatario } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {

    let SignatarioTokenEnviadoEmail = await Signatario.findOne({
        where: { SignatarioToken: Requisicao.params.SignatarioToken },
        attributes: ["SignatarioTokenEnviadoEmail"]
    })

    Resposta.json(SignatarioTokenEnviadoEmail)
}