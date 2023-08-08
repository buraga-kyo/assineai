const { Documento, Signatario, DocumentoExtra } = require("../../BancoDeDados/Conector").Tabelas;

module.exports = async (Requisicao, Resposta) => {
    
    try {

        let RegistroSignatario = await Signatario.findOne({
            where: { SignatarioToken: Requisicao.params.SignatarioToken },
            attributes: ["DocumentoId", "SignatarioQuantidadeDeAcessosNoLinkDeAssinatura", "SignatarioStatusAssinatura"]
        })

        let SignatarioQuantidadeDeAcessosNoLinkDeAssinatura = RegistroSignatario.SignatarioQuantidadeDeAcessosNoLinkDeAssinatura

        Signatario.update(
            { SignatarioQuantidadeDeAcessosNoLinkDeAssinatura: SignatarioQuantidadeDeAcessosNoLinkDeAssinatura +=1 },
            { where: { SignatarioToken: Requisicao.params.SignatarioToken } }
        )

        let RegistroDocumento = await Documento.findOne({
            where: { DocumentoId: RegistroSignatario.DocumentoId },
            attributes: ["DocumentoId", "DocumentoNome"]
        })      

        let RegistroDocumentoExtra = await DocumentoExtra.findAll({
            where: { DocumentoId: RegistroSignatario.DocumentoId },
            attributes: ["DocumentoId", "DocumentoExtraNome"]
        }) 
        
        if (RegistroSignatario.SignatarioStatusAssinatura != "Assinado") {
            let Mensagem = ''
            if (SignatarioQuantidadeDeAcessosNoLinkDeAssinatura == 1) {
                Mensagem = 'Acessou '+SignatarioQuantidadeDeAcessosNoLinkDeAssinatura+' vez o link de assinatura'
            } else {
                Mensagem = 'Acessou '+SignatarioQuantidadeDeAcessosNoLinkDeAssinatura+' vezes o link de assinatura'
            }
    
            Signatario.update(
                { SignatarioMensagemSobreVisualizacaoDoLinkDeAssinatura: Mensagem, SignatarioStatusAssinatura: 'Em Processo' },
                { where: { SignatarioToken: Requisicao.params.SignatarioToken } }
            )
        }

        const MapRegistroDocumentoExtra = RegistroDocumentoExtra.map(({dataValues}) => {
            return {
                ...dataValues
            }
        })

        let Registro = {}
        Registro.DocumentoExtra = [
            RegistroDocumento.dataValues,
            ...MapRegistroDocumentoExtra
        ]

        Resposta.json(Registro)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}