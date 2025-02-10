const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {

    const signatario = await Signatarios.findOne({
        raw: true,
        where: {
            SignatarioTokenLinkAssinatura: Requisicao.body.SignatarioToken
        },
        attributes: ["AssinaturaId", "SignatarioTokenEmail", "SignatarioTokenWhatsApp"]
    });

    console.log(signatario);

}