const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;
const { InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector")

module.exports = async (Requisicao, Resposta) => {

  try {

    const signatario = await Signatarios.findOne({
      where: {
        SignatarioTokenLinkAssinatura: Requisicao.query.SignatarioToken
      },
      attributes: ["AssinaturaId", "SignatarioNome", "SignatarioEmail", "SignatarioWhatsApp", "SignatarioTokenEmail", "SignatarioTokenWhatsApp", "SignatarioAssinou"]
    });

    /*const assinaturaId = await Signatarios.findOne({
      where: {
        SignatarioTokenLinkAssinatura: Requisicao.query.SignatarioToken
      },
      attributes: ["AssinaturaId"]
    });

    const signatario = await Signatarios.findAll({
      where: {
        AssinaturaId: assinaturaId.dataValues.AssinaturaId
      }
    });*/

    const documentos = await Documentos.findAll({
      where: {
        AssinaturaId: signatario.dataValues.AssinaturaId
      }
    });

    Resposta.json({ Signatario: signatario, Documentos: documentos })

  } catch (Erro) {
    console.log(Erro)
    Resposta.sendStatus(500)
  }

}