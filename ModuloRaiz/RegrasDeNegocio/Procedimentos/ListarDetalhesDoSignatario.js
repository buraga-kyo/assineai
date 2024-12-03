const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;
const { InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector")

module.exports = async (Requisicao, Resposta) => {

  try {

    const signatario = await Signatarios.findOne({
      where: {
        SignatarioTokenLinkAssinatura: Requisicao.query.SignatarioToken
      }
    });

    const documentos = await Documentos.findAll({
      where: {
        AssinaturaId: signatario.dataValues.AssinaturaId
      }
    });

    console.log(documentos)

    Resposta.json({ Signatario: signatario, Documentos: documentos })

  } catch (Erro) {
    console.log(Erro)
    Resposta.sendStatus(500)
  }

}