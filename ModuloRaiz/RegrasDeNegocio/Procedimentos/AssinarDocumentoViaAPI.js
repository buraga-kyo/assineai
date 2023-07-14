const { Signatario } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {
    const { dataValues: RegistrosDoSignatario } = await Signatario.findOne({ where: { SignatarioToken: Requisicao.body.SignatarioToken } })
    console.log(RegistrosDoSignatario)
    Resposta.sendStatus(200)
}