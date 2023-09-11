const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const {Sequelize, Op} = require("sequelize");
const Configuracao = require("../../BancoDeDados/Configuracao")

const sequelize = new Sequelize(
    Configuracao.DB,
    Configuracao.USER,
    Configuracao.PASSWORD,
    {
        host: Configuracao.HOST,
        dialect: Configuracao.dialect,
        logging: false,
        operatorsAliases: 0,
        pool: {
            max: Configuracao.pool.max,
            min: Configuracao.pool.min,
            acquire: Configuracao.pool.acquire,
            idle: Configuracao.pool.idle,
        },
    }
)

module.exports = async (Requisicao, Resposta) => {

    try {

        const { FiltroDeStatus, FiltroDeProcura, FiltroDeData, Sort } = Requisicao.body;

        const Filtro = {};
        if (FiltroDeStatus) Filtro.DocumentoStatusAssinatura = FiltroDeStatus;
        if (FiltroDeProcura) Filtro.DocumentoNome = { [Op.iLike]: "%"+FiltroDeProcura+"%" }
        if (FiltroDeData?.includes(" to ")) Filtro.DocumentoDataDeGeracao = { [Op.between]: [FiltroDeData.split(" to ")[0], FiltroDeData.split(" to ")[1]] }
        else if (FiltroDeData != null) {  
                Filtro.DocumentoDataDeGeracao =  sequelize.where(
                sequelize.fn('date_trunc', 'day', sequelize.col('DocumentoDataDeGeracao')),
                FiltroDeData
            )
        }

        let Order = [];
        if (Sort && Sort?.field) {
          if (Sort.field === 'Signatarios') {
            
            Order = [
              [Sequelize.literal('"SignatarioNome"'), Sort.type.toUpperCase()],
            ];
          } else {
            
            Order = [[Sort.field, Sort.type.toUpperCase()]];
          }
        }

        // let Order = [];
        // if (Sort && Sort.field) {
        //   if (Sort.field === 'Signatarios') {
        //     Order = [
        //       [{ model: Signatario, as: 'Signatarios' }, Sort.field, Sort.type.toUpperCase()],
        //     ];
        //   } else {
        //     Order = [[Sort.field, Sort.type.toUpperCase()]];
        //   }
        // }

        // let Order = [];
        // if(Sort && Sort?.field){
        //     Order = [
        //         Sort.field = [Sort.field, Sort.type.toUpperCase()]
        //     ];
        // }

        let Documentos = await Documento.findAndCountAll({
            where: Filtro,
            offset: Requisicao.body.QtdPularRegistrosPular,
            limit: Requisicao.body.limiteRegistros,
            attributes: ["DocumentoId", "DocumentoNome", "DocumentoStatusAssinatura", "DocumentoToken", "DocumentoDataDeGeracao"],
            include: [{model: Signatario, as: 'Signatarios', attributes: ['SignatarioNome']}],
            order: Order
        })

        // let Signatarios = []

        // for await (let Documento of Documentos.rows) {

        //     Signatarios = await Signatario.findAll({
        //         where: { DocumentoId: Documento.dataValues.DocumentoId },
        //         attributes: ["SignatarioNome", "SignatarioStatusAssinatura", "SignatarioId"]
        //     })

        //     Documentos.rows[Documentos.rows.indexOf(Documento)].dataValues.Signatarios = Signatarios;

        // }

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



        // if(FiltroDeStatus != null){
        //     where = {
        //         [Op.and] : [
        //             {
        //                 DocumentoStatusAssinatura:{
        //                     [Op.eq] : FiltroDeStatus
        //                 } 
        //             },
        //             {
        //                 [Op.or]: [
        //                     {
        //                         DocumentoNome: {
        //                             [Op.iLike] : FiltroDeProcura + "%"
        //                         }
        //                     },
        //                 ],
        //             }
        //         ]


        //     };
        // }else{
        //     where = {
        //         [Op.or]: [
        //             {
        //                 DocumentoNome: {
        //                     [Op.iLike] : FiltroDeProcura + "%"
        //                 }
        //             },
        //         ] 
        //     };
        // }
