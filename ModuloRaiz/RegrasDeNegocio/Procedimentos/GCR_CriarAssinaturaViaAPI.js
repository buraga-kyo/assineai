const GCA_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/GCA_ConstruirPaginaComDadosDeAssinatura")
const DataAtualFormatada = require("../Ferramentas/FuncoesGenericas/DataAtualFormatada")
const CalcularHash = require("../Ferramentas/FuncoesGenericas/CalcularHash")
const CriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")
const crypto = require("crypto")

module.exports = async ({ connection, headers, socket, body: { Documentos, Signatarios } }, Resposta) => {

    console.log(Signatarios)

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
        let { ChavePublica, Assinatura } = CriptografiaAssimetrica(Documentos[i].DocumentoBase64)

        DocumentoComDadosDeAssinatura.DocumentoId = Documentos[i].DocumentoId
        DocumentoComDadosDeAssinatura.DocumentoHASH = Documentos[i].DocumentoHASH
        DocumentoComDadosDeAssinatura.DocumentoToken = Documentos[i].DocumentoToken
        DocumentoComDadosDeAssinatura.DocumentoChavePublica = ChavePublica
        DocumentoComDadosDeAssinatura.DocumentoAssinaturaChavePrivada = Assinatura
        DocumentoComDadosDeAssinatura.DocumentoBase64Atualizado = DocumentoBase64Atualizado
        ColecaoDeDocumentos.push(DocumentoComDadosDeAssinatura) 

    }

    Resposta.json(ColecaoDeDocumentos)

}