const { Assinatura, Signatarios, Documentos } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;
const { InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector")

module.exports = async (Requisicao, Resposta) => {

  try {

    console.log("Chegou")

    const {
      AssinaturaId,
      createdAt,
      AssinaturaResponsavel,
      AssinaturaNome,
      AssinaturaDocumentos,
      AssinaturaSignatarios,
      AssinaturaStatus,
      ItemsPorPagina,
      offset,
      order
    } = Requisicao.body;

    const Filtro = {};
    const FiltroDocumentos = {};
    const FiltroSignatarios = {};
    let Order = [];

    if (order) {
      Order = [["AssinaturaId", order.toUpperCase()]];
    } else {
      Order = [["AssinaturaId", "DESC"]];
    }
    if (AssinaturaId) Filtro.AssinaturaId = AssinaturaId
    if (AssinaturaResponsavel) Filtro.AssinaturaResponsavel = { [Op.iLike]: "%" + AssinaturaResponsavel + "%" }
    if (AssinaturaNome) Filtro.AssinaturaNome = { [Op.iLike]: "%" + AssinaturaNome + "%" }
    if (AssinaturaDocumentos) FiltroDocumentos.DocumentoTitulo = { [Op.iLike]: "%" + AssinaturaDocumentos + "%" }
    if (AssinaturaSignatarios) FiltroSignatarios.SignatarioNome = { [Op.iLike]: "%" + AssinaturaSignatarios + "%" }
    if (AssinaturaStatus) Filtro.AssinaturaStatus = AssinaturaStatus
    if (createdAt != null) {

      if (createdAt?.includes(" até ")) {

        const DataAntesDoAte = createdAt.split(" até ")[0]

        var PartesDaData = DataAntesDoAte.split('-')
        var dia = PartesDaData[0]
        var mes = PartesDaData[1]
        var ano = PartesDaData[2]

        var DataAntesDoAteFormatada = `${ano}-${mes}-${dia}`

        const DataDepoisDoAte = createdAt.split(" até ")[1]

        PartesDaData = DataDepoisDoAte.split('-')
        dia = PartesDaData[0]
        mes = PartesDaData[1]
        ano = PartesDaData[2]

        var DataDepoisDoAteFormatada = `${ano}-${mes}-${dia}`

        var DataInicial = new Date(DataAntesDoAteFormatada)
        var DataFinal = new Date(DataDepoisDoAteFormatada)

        DataFinal.setUTCHours(23, 59, 59, 999); //Setando a hora da data fim no final do dia

        Filtro.createdAt = { [Op.between]: [DataInicial, DataFinal] }

      } else {

        const PartesDaData = createdAt.split('-')
        const dia = PartesDaData[0]
        const mes = PartesDaData[1]
        const ano = PartesDaData[2]
        var DataFormatada = `${ano}-${mes}-${dia}`

        var DataInicial = new Date(DataFormatada)
        var DataFinal = new Date(DataFormatada)

        DataFinal.setUTCHours(23, 59, 59, 999)

        Filtro.createdAt = { [Op.between]: [DataInicial, DataFinal] }

      }

    }

    let assinaturas = await Assinatura.findAndCountAll({
      where: Filtro,
      limit: ItemsPorPagina,
      offset,
      order: Order,
      include: [
        { model: Signatarios, attributes: ['SignatarioNome'], where: FiltroSignatarios },
        { model: Documentos, attributes: ['DocumentoTitulo'], where: FiltroDocumentos }
      ],
    })

    assinaturas.totalDeAssinaturas = await Assinatura.count()

    Resposta.json(assinaturas)

  } catch (Erro) {
    console.log(Erro)
    Resposta.sendStatus(500)
  }

}