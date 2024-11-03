const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {

  try {
    console.log(Requisicao.query)

    RegistrosDaAssinatura = await Assinatura.findOne({
      where: { AssinaturaId: Requisicao.query.AssinaturaId },
      include: [
        {
          model: Signatarios,
          attributes: [
            'SignatarioNome',
            'SignatarioEmail',
            'SignatarioRG',
            'SignatarioCPF',
            'SignatarioWhatsApp',
            'SignatarioSituacaoAssinatura',
            'SignatarioTokenLinkAssinatura',
            'SignatarioAssinou',
          ]
        },
        { model: Documentos, attributes: ['DocumentoTitulo'] }
      ],
    })

    console.log(RegistrosDaAssinatura)

    Resposta.json(RegistrosDaAssinatura)

  } catch (Erro) {
    console.log(Erro)
    Resposta.sendStatus(500)
  }

}