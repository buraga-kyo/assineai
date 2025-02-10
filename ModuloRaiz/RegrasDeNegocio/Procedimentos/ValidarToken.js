const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {

    const signatario = await Signatarios.findOne({
        raw: true,
        where: {
            SignatarioTokenLinkAssinatura: Requisicao.body.SignatarioToken
        },
        attributes: ["AssinaturaId", "SignatarioTokenEmail", "SignatarioTokenWhatsApp"]
    });

    if (Requisicao.body.otp == signatario.SignatarioTokenEmail || Requisicao.body.otp == signatario.SignatarioTokenWhatsApp) {
        Resposta.status(200).send(true)
    } else {
        Resposta.status(200).send(false)
    }

}