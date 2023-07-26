const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {
    
    try {

        let Documentos = await Documento.findAll({
            where: { DocumentoToken: Requisicao.params.token },
            attributes: ["DocumentoId","DocumentoNome","DocumentoStatusAssinatura","DocumentoToken","DocumentoResponsavel","createdAt"]
        })
        let Signatarios = []
        
        for await (let Documento of Documentos){
            
            Signatarios = await Signatario.findAll({ 
                where: { DocumentoId: Documento.dataValues.DocumentoId },
                attributes: ["SignatarioNome", "SignatarioStatusAssinatura", "SignatarioId", "SignatarioLinkAssinatura"]
            })
            
            TotalDeSignatarios = await Signatario.count({ where: { DocumentoId: Documento.dataValues.DocumentoId } })
            TotalDeAssinaturas = await Signatario.count({ where: { SignatarioStatusAssinatura: 'Assinado', DocumentoId: Documento.dataValues.DocumentoId } })

            Documentos[Documentos.indexOf(Documento)].dataValues.Signatarios = Signatarios;
            Documentos[Documentos.indexOf(Documento)].dataValues.TotalDeSignatarios = TotalDeSignatarios;
            Documentos[Documentos.indexOf(Documento)].dataValues.TotalDeAssinaturas = TotalDeAssinaturas;
        }

        Resposta.json(Documentos)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}