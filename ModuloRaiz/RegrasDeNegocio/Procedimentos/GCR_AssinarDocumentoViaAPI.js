const GCA_ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/GCA_ConstruirPaginaComDadosDeAssinatura")

module.exports = async ({ body: { Documentos, Signatarios } }, Resposta) => {

    var DocumentoComDadosDeAssinatura = {}
    var ColecaoDeDocumentos = []

    for (let i = 0; i < Documentos.length; i++) {

        var DocumentoBase64Atualizado = await GCA_ConstruirPaginaComDadosDeAssinatura(Documentos[i], Signatarios)

        DocumentoComDadosDeAssinatura.DocumentoId = Documentos[i].DocumentoId
        DocumentoComDadosDeAssinatura.DocumentoBase64Atualizado = DocumentoBase64Atualizado
        ColecaoDeDocumentos.push(DocumentoComDadosDeAssinatura)

    }

    Resposta.json(ColecaoDeDocumentos)

}