const { Assinatura, Signatarios, Documentos, SignatarioHistorico } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {

  try {

    RegistrosDaAssinatura = await Assinatura.findOne({
      where: { AssinaturaId: Requisicao.query.AssinaturaId },
      include: [
        {
          model: Signatarios,
          attributes: [
            'SignatarioId',
            'SignatarioNome',
            'SignatarioEmail',
            'SignatarioRG',
            'SignatarioCPF',
            'SignatarioWhatsApp',
            'SignatarioSituacaoAssinatura',
            'SignatarioTokenLinkAssinatura',
            'SignatarioAssinou',
          ],
          include: [
            {
              model: SignatarioHistorico,
              as: "historicos"
            }
          ]
        },
        { model: Documentos, attributes: ['DocumentoTitulo'] }
      ],
    })

    Resposta.json(RegistrosDaAssinatura)

  } catch (Erro) {
    console.log(Erro)
    Resposta.sendStatus(500)
  }

}