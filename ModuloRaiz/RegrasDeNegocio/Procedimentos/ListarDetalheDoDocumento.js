const { Documento, Signatario, DocumentoExtra } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {
    
    try {
        let DocumentoId, RegistrosDoDocumento, RegistrosDosDocumentosExtras, RegistrosDosSignatarios, TotalDeSignatarios, TotalDeAssinaturas

        RegistrosDoDocumento = await Documento.findOne({
            where: { DocumentoToken: Requisicao.params.DocumentoToken },
            attributes: [
                "DocumentoId","DocumentoNome","DocumentoStatusAssinatura",
                "DocumentoToken","DocumentoResponsavel","ArquivoOriginalId",
                "ArquivoAssinadoId","createdAt"
            ]
        })

        DocumentoId = RegistrosDoDocumento.dataValues.DocumentoId

        RegistrosDosDocumentosExtras = await DocumentoExtra.findAll({ 
            where: { DocumentoId },
            attributes: [
                "DocumentoExtraId","DocumentoExtraNome"
            ]            
        })

        RegistrosDosSignatarios = await Signatario.findAll({ 
            where: { DocumentoId },
            attributes: ["SignatarioNome", "SignatarioStatusAssinatura", "SignatarioId", "SignatarioLinkAssinatura"]
        })

        TotalDeSignatarios = await Signatario.count({ 
            where: { DocumentoId } 
        })

        TotalDeAssinaturas = await Signatario.count({ 
            where: { SignatarioStatusAssinatura: 'Assinado', DocumentoId } 
        })

        RegistrosDoDocumento.dataValues.RegistrosDosDocumentosExtras = RegistrosDosDocumentosExtras
        RegistrosDoDocumento.dataValues.RegistrosDosSignatarios = RegistrosDosSignatarios
        RegistrosDoDocumento.dataValues.TotalDeSignatarios = TotalDeSignatarios
        RegistrosDoDocumento.dataValues.TotalDeAssinaturas = TotalDeAssinaturas

        Resposta.json(RegistrosDoDocumento)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}









        // let Documentos = await Documento.findAll({
        //     where: { DocumentoToken: Requisicao.params.DocumentoToken },
        //     attributes: ["DocumentoId","DocumentoNome","DocumentoStatusAssinatura","DocumentoToken","DocumentoResponsavel","ArquivoOriginalId","ArquivoAssinadoId","createdAt"]
        // })
        // let Signatarios = []
        // let Base64DocumentoExtraOriginal = []
        
        // for await (let Documento of Documentos){
            
        //     Extras = await DocumentoExtra.findAll({ 
        //         where: { DocumentoId: Documento.dataValues.DocumentoId },
        //     })

        //     if (Extras.length > 0) {
        //         for await (let Extra of Extras) {
        //             DocExtra = await Arquivo.findOne({
        //                 where: { ArquivoId: Extra.dataValues.ArquivoOriginalId },
        //                 attributes: ["ArquivoBase64"]
        //             })
                    
        //             Base64DocumentoExtraOriginal.push(DocExtra)
        //         }

        //         Documentos[Documentos.indexOf(Documento)].dataValues.Base64Extras = Base64DocumentoExtraOriginal;
        //         DocExtra = []
        //     }

        //     Signatarios = await Signatario.findAll({ 
        //         where: { DocumentoId: Documento.dataValues.DocumentoId },
        //         attributes: ["SignatarioNome", "SignatarioStatusAssinatura", "SignatarioId", "SignatarioLinkAssinatura"]
        //     })
                
        //     Base64DocumentoOriginal = await Arquivo.findOne({
        //         where: { ArquivoId: Documento.dataValues.ArquivoOriginalId },
        //         attributes: ["ArquivoBase64"]
        //     })

        //     if (Documento.dataValues.ArquivoAssinadoId != null) {
        //         Base64DocumentoAssinado = await Arquivo.findOne({
        //             where: { ArquivoId: Documento.dataValues.ArquivoAssinadoId },
        //             attributes: ["ArquivoBase64"]
        //         })

        //         Documentos[Documentos.indexOf(Documento)].dataValues.Base64DocumentoAssinado = Base64DocumentoAssinado.dataValues.ArquivoBase64;
        //     }   

        //     TotalDeSignatarios = await Signatario.count({ where: { DocumentoId: Documento.dataValues.DocumentoId } })
        //     TotalDeAssinaturas = await Signatario.count({ where: { SignatarioStatusAssinatura: 'Assinado', DocumentoId: Documento.dataValues.DocumentoId } })
            
        //     Documentos[Documentos.indexOf(Documento)].dataValues.Signatarios = Signatarios;
        //     Documentos[Documentos.indexOf(Documento)].dataValues.Extras = Extras;
        //     Documentos[Documentos.indexOf(Documento)].dataValues.Base64DocumentoOriginal = Base64DocumentoOriginal.dataValues.ArquivoBase64;
        //     Documentos[Documentos.indexOf(Documento)].dataValues.TotalDeSignatarios = TotalDeSignatarios;
        //     Documentos[Documentos.indexOf(Documento)].dataValues.TotalDeAssinaturas = TotalDeAssinaturas;
        // }