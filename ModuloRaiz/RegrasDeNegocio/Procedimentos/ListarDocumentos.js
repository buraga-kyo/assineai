const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;

module.exports = async (Requisicao, Resposta) => {
    
    try {

        let Filtros = {}

        if (Requisicao.body.FiltroDeStatus != null || Requisicao.body.FiltroDeStatus != '') {
            Filtros.DocumentoStatusAssinatura = Requisicao.body.FiltroDeStatus
        }

        console.log(Filtros)

        let Documentos = await Documento.findAndCountAll({
            where: { [Op.and]: Filtros },
            offset: Requisicao.body.QtdPularRegistrosPular,
            limit: Requisicao.body.limiteRegistros,
            attributes: ["DocumentoId","DocumentoNome","DocumentoStatusAssinatura","DocumentoToken","createdAt"]
        })
        let Signatarios = []
        
        for await (let Documento of Documentos.rows){
            
            Signatarios = await Signatario.findAll({ 
                where: { DocumentoId: Documento.dataValues.DocumentoId },
                attributes: ["SignatarioNome", "SignatarioStatusAssinatura", "SignatarioId"]
            })
            
            Documentos.rows[Documentos.rows.indexOf(Documento)].dataValues.Signatarios = Signatarios;

        }

        Resposta.json(Documentos)

        // let Documentos = await Documento.findAll({ attributes:["DocumentoId","DocumentoNome","DocumentoStatusAssinatura","createdAt"]})
        // let Signatarios = []
        
        // for await (let Documento of Documentos){
            
        //     Signatarios = await Signatario.findAll({ 
        //         where: { DocumentoId: Documento.dataValues.DocumentoId },
        //         attributes: ["SignatarioNome", "SignatarioStatusAssinatura", "SignatarioId"]
        //     })
            
        //     Documentos[Documentos.indexOf(Documento)].dataValues.Signatarios = Signatarios;

        // }

        // Resposta.json(Documentos)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}