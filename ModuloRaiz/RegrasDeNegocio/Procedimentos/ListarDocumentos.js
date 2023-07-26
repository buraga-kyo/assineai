const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const Op = require("sequelize").Op;

module.exports = async (Requisicao, Resposta) => {
    
    try {

        const { FiltroDeStatus, FiltroDeProcura } = Requisicao.body;

        var where = {};
        if(FiltroDeStatus != null){
            where = {
                [Op.and] : [
                    {
                        DocumentoStatusAssinatura:{
                            [Op.eq] : FiltroDeStatus
                        } 
                    },
                    {
                        [Op.or]: [
                            {
                                DocumentoTitulo: {
                                    [Op.iLike] : FiltroDeProcura + "%"
                                }
                            },
                        ],
                    }
                ]
                
                
            };
        }else{
            where = {
                [Op.or]: [
                    {
                        DocumentoTitulo: {
                            [Op.iLike] : FiltroDeProcura + "%"
                        }
                    },
                ] 
            };
        }

        let Documentos = await Documento.findAndCountAll({
            where: where,
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

        Documentos.TotalDeDocumentos = await Documento.count()
        Documentos.DocumentosAssinados = await Documento.count({ where: { DocumentoStatusAssinatura: 'Assinado' } })
        Documentos.DocumentosEmProcesso = await Documento.count({ where: { DocumentoStatusAssinatura: 'Em Processo' } })

        console.log(Documentos)
        Resposta.json(Documentos)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}