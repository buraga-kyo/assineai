const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;
const { InstanciaConfiguradaDoSequelize } = require("../../BancoDeDados/Conector")

module.exports = async (Requisicao, Resposta) => {

    try {

        const { FiltroDeStatus, FiltroDeProcura, FiltroDeData, Sort } = Requisicao.body;
        const Filtro = {};

        if (FiltroDeStatus) Filtro.DocumentoStatusAssinatura = FiltroDeStatus;
        if (FiltroDeProcura) Filtro.DocumentoNome = { [Op.iLike]: "%"+FiltroDeProcura+"%" }
        if (FiltroDeData != null) {

            if (FiltroDeData?.includes(" até ")) {

                const DataAntesDoAte = FiltroDeData.split(" até ")[0]

                var PartesDaData = DataAntesDoAte.split('-')
                var dia = PartesDaData[0]
                var mes = PartesDaData[1]
                var ano = PartesDaData[2]

                var DataAntesDoAteFormatada = `${ano}-${mes}-${dia}`

                const DataDepoisDoAte = FiltroDeData.split(" até ")[1]

                PartesDaData = DataDepoisDoAte.split('-')
                dia = PartesDaData[0]
                mes = PartesDaData[1]
                ano = PartesDaData[2]

                var DataDepoisDoAteFormatada = `${ano}-${mes}-${dia}`
                
                var DataInicial = new Date(DataAntesDoAteFormatada)
                var DataFinal = new Date(DataDepoisDoAteFormatada)

                DataFinal.setUTCHours(23,59,59,999); //Setando a hora da data fim no final do dia

                Filtro.DocumentoDataDeGeracao = { [Op.between]: [DataInicial, DataFinal] }

            } else {

                const PartesDaData = FiltroDeData.split('-')
                const dia = PartesDaData[0]
                const mes = PartesDaData[1]
                const ano = PartesDaData[2]
                var DataFormatada = `${ano}-${mes}-${dia}`

                var DataInicial = new Date(DataFormatada)
                var DataFinal = new Date(DataFormatada)

                DataFinal.setUTCHours(23,59,59,999)

                Filtro.DocumentoDataDeGeracao = { [Op.between]: [DataInicial, DataFinal] }

            }

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