const { Documento, Signatario, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/ConstruirPaginaComDadosDeAssinatura");
const crypto = require("crypto");

module.exports = async (Requisicao, Resposta, ProximaFuncao) => {
    
    try {

        const RegistroArquivo = {
            ArquivoBase64: Requisicao.body.DocumentoBase64,
        }
        const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        const RegistroDoDocumento = {
            DocumentoNome: Requisicao.body.DocumentoNome,
            DocumentoGUID: crypto.randomUUID(),
            ArquivoOriginalId: ArquivoId
        }
        const { DocumentoId } = await Documento.create(RegistroDoDocumento)

        const ColecaoDeSignatarios = Requisicao.body.Signatarios

        ColecaoDeSignatarios.forEach((RegistroDoSignatario) => {
            Signatario.create(RegistroDoSignatario)
        })
        
        const DocumentoBase64Atualizado = await ConstruirPaginaComDadosDeAssinatura(RegistroArquivo.ArquivoBase64, DocumentoId)

        const { ArquivoId: ArquivoEmAndamentoId } = await Arquivo.create({ ArquivoBase64: DocumentoBase64Atualizado })

        Documento.update({ ArquivoEmAndamentoId }, { where: { DocumentoId } })

        Resposta.json(RegistroDoDocumento)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}