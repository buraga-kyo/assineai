const GCA_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/GCA_ConstruirPaginaComDadosDeAssinatura")
const crypto = require("crypto")
const CalcularHash = require("../Ferramentas/FuncoesGenericas/CalcularHash")
const CriptografiaAssimetrica = require("../Ferramentas/LidarComAssinatura/CriptografiaAssimetrica")

module.exports = async ({ body: { Documentos, Signatarios } }, Resposta) => {

    var DocumentoComDadosDeAssinatura = {}
    var ColecaoDeDocumentos = []

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