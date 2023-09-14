const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;
const { InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector")

module.exports = async (Requisicao, Resposta) => {

    try {

        const { FiltroDeStatus, FiltroDeProcura, FiltroDeData, Sort } = Requisicao.body;
        console.log(FiltroDeData)
        const Filtro = {};
        if (FiltroDeStatus) Filtro.DocumentoStatusAssinatura = FiltroDeStatus;
        if (FiltroDeProcura) Filtro.DocumentoNome = { [Op.iLike]: "%"+FiltroDeProcura+"%" }
        if (FiltroDeData?.includes(" até ")) Filtro.DocumentoDataDeGeracao = { [Op.between]: [FiltroDeData.split(" até ")[0], FiltroDeData.split(" até ")[1]] }
        else if (FiltroDeData != null) {  
                Filtro.DocumentoDataDeGeracao =  InstanciaConfiguradaDoSequelize.where(
                    InstanciaConfiguradaDoSequelize.fn('date_trunc', 'day', InstanciaConfiguradaDoSequelize.col('DocumentoDataDeGeracao')),
                FiltroDeData
            )
        }

        let Order = [];
        if (Sort && Sort?.field) {
          if (Sort.field === 'Signatarios') {
            
            Order = [
              [InstanciaConfiguradaDoSequelize.literal('"SignatarioNome"'), Sort.type.toUpperCase()],
            ];
          } else {
            
            Order = [[Sort.field, Sort.type.toUpperCase()]];
          }
        }

        let Documentos = await Documento.findAndCountAll({
            where: Filtro,
            offset: Requisicao.body.QtdPularRegistrosPular,
            limit: Requisicao.body.limiteRegistros,
            attributes: ["DocumentoId", "DocumentoNome", "DocumentoStatusAssinatura", "DocumentoToken", "DocumentoDataDeGeracao"],
            include: [{model: Signatario, as: 'Signatarios', attributes: ['SignatarioNome']}],
            order: Order
        })

        Documentos.TotalDeDocumentos = await Documento.count()
        Documentos.DocumentosAssinados = await Documento.count({ where: { DocumentoStatusAssinatura: 'Assinado' } })
        Documentos.DocumentosEmProcesso = await Documento.count({ where: { DocumentoStatusAssinatura: 'Em Processo' } })
        Documentos.DocumentosExcluidos = await Documento.count({ where: { DocumentoStatusAssinatura: 'Excluido' } })

        Resposta.json(Documentos)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }


}