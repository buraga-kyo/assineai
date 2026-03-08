const { Documento, Signatario, DocumentoExtra } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {
    
    try {

        let RegistroSignatario = await Signatario.findOne({
            where: { SignatarioToken: Requisicao.params.SignatarioToken },
            attributes: ["DocumentoId", "SignatarioQuantidadeDeAcessosNoLinkDeAssinatura", "SignatarioSituacaoAssinatura", "SignatarioMensagemSobreVisualizacaoDoLinkDeAssinatura"]
        })

        let RegistroDocumento = await Documento.findOne({
            where: { DocumentoId: RegistroSignatario.DocumentoId },
            attributes: ["DocumentoId", "DocumentoNome", "DocumentoStatusAssinatura", "createdAt"]
        })      

        let RegistroDocumentoExtra = await DocumentoExtra.findAll({
            where: { DocumentoId: RegistroSignatario.DocumentoId },
            attributes: ["DocumentoExtraId", "DocumentoId", "DocumentoExtraNome"]
        }) 
        
        if (RegistroSignatario.SignatarioSituacaoAssinatura != "Assinado") {
            let SignatarioQuantidadeDeAcessosNoLinkDeAssinatura = RegistroSignatario.SignatarioQuantidadeDeAcessosNoLinkDeAssinatura

            Signatario.update(
                { SignatarioQuantidadeDeAcessosNoLinkDeAssinatura: SignatarioQuantidadeDeAcessosNoLinkDeAssinatura +=1 },
                { where: { SignatarioToken: Requisicao.params.SignatarioToken } }
            )

            let Mensagem = ''
            if (SignatarioQuantidadeDeAcessosNoLinkDeAssinatura == 1) {
                Mensagem = 'Acessou '+SignatarioQuantidadeDeAcessosNoLinkDeAssinatura+' vez o link de assinatura'
            } else {
                Mensagem = 'Acessou '+SignatarioQuantidadeDeAcessosNoLinkDeAssinatura+' vezes o link de assinatura'
            }
    
            Signatario.update(
                { SignatarioMensagemSobreVisualizacaoDoLinkDeAssinatura: Mensagem, SignatarioSituacaoAssinatura: 'Em Processo' },
                { where: { SignatarioToken: Requisicao.params.SignatarioToken } }
            )
        }

        let Registro = {}
        Registro.DocumentoPrincipal = RegistroDocumento
        Registro.DocumentoExtra = RegistroDocumentoExtra
        Registro.RegistroSignatario = RegistroSignatario

        console.log(Registro.DocumentoPrincipal)
        Resposta.json(Registro)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}