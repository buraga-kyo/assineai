const CalcularHash = require("../Ferramentas/FuncoesGenericas/CalcularHash")
const crypto = require("crypto")

module.exports = async (Requisicao, Resposta) => {

    var DadosDaAssinatura = {}
    
    DadosDaAssinatura.Hash = CalcularHash(Requisicao.body.DocumentoBase64)
    DadosDaAssinatura.Token = crypto.randomUUID()

    Resposta.json(DadosDaAssinatura)

}

/*************
var DocumentoComDadosDeAssinatura = {}
var ColecaoDeDocumentos = []

for (let i = 0; i < Signatarios.length; i++) {

    if (Signatarios[i].SignatarioQualificacao === 'Cliente') {

        Signatarios[i].SignatarioIp = connection.remoteAddress 
        || socket.remoteAddress 
        || connection.socket.remoteAddress

        Signatarios[i].SignatarioDispositivo = headers['user-agent']

    }

    Signatarios[i].SignatarioDataAssinatura = DataAtualFormatada()
    Signatarios[i].SignatarioToken = crypto.randomUUID()
}

for (let i = 0; i < Documentos.length; i++) {

    Documentos[i].DocumentoHASH = CalcularHash(Documentos[i].DocumentoBase64)
    Documentos[i].DocumentoToken = crypto.randomUUID()

    let DocumentoBase64Atualizado = await GCA_ConstruirPaginaComDadosDeAssinatura(Documentos[i], Signatarios)

    let { ChavePublica, Assinatura } = CriptografiaAssimetrica(DocumentoBase64Atualizado)

    DocumentoComDadosDeAssinatura.DocumentoId = Documentos[i].DocumentoId
    DocumentoComDadosDeAssinatura.DocumentoHASH = Documentos[i].DocumentoHASH
    DocumentoComDadosDeAssinatura.DocumentoToken = Documentos[i].DocumentoToken
    DocumentoComDadosDeAssinatura.DocumentoChavePublica = ChavePublica
    DocumentoComDadosDeAssinatura.DocumentoAssinaturaChavePrivada = Assinatura
    DocumentoComDadosDeAssinatura.DocumentoEmpresaSituacaoAssinatura = "Assinou em "+DataAtualFormatada()
    DocumentoComDadosDeAssinatura.DocumentoEmpresaIp = Signatarios[0].SignatarioIp
    DocumentoComDadosDeAssinatura.DocumentoBase64Atualizado = DocumentoBase64Atualizado
    DocumentoComDadosDeAssinatura.DocumentoTokenEnviadoEmail = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6)
    ColecaoDeDocumentos.push(DocumentoComDadosDeAssinatura) 

}
************/