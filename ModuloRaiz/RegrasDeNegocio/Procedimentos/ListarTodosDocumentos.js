const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;

module.exports = async (Requisicao, Resposta) => {

    try {

        const { FiltroDeStatus, FiltroDeProcura, FiltroDeData } = Requisicao.body;

        console.log(FiltroDeData)

        const where = {};
        if (FiltroDeStatus) where.DocumentoStatusAssinatura = FiltroDeStatus;
        if (FiltroDeProcura) where.DocumentoNome = { [Op.iLike]: "%"+FiltroDeProcura+"%" }
        if (FiltroDeData?.includes(" to ")) where.createdAt = { [Op.between]: [FiltroDeData.split(" to ")[0], FiltroDeData.split(" to ")[1]] }

        let Documentos = await Documento.findAndCountAll({
            where: where,
            offset: Requisicao.body.QtdPularRegistrosPular,
            limit: Requisicao.body.limiteRegistros,
            attributes: ["DocumentoId", "DocumentoNome", "DocumentoStatusAssinatura", "DocumentoToken", "createdAt"]
        })
        let Signatarios = []

        for await (let Documento of Documentos.rows) {

            Signatarios = await Signatario.findAll({
                where: { DocumentoId: Documento.dataValues.DocumentoId },
                attributes: ["SignatarioNome", "SignatarioStatusAssinatura", "SignatarioId"]
            })

            Documentos.rows[Documentos.rows.indexOf(Documento)].dataValues.Signatarios = Signatarios;

        }

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
