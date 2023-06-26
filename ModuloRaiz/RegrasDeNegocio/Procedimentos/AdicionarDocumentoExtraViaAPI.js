const { Documento, DocumentoExtra, Arquivo } = require("../../BancoDeDados/Conector").Tabelas;
const ConstruirPaginaComDadosDeAssinatura = require("../Ferramentas/ManipulacaoDePDF/ConstruirPaginaComDadosDeAssinatura");
const crypto = require("crypto");

module.exports = async (Requisicao, Resposta, ProximaFuncao) => {
    
    try {

        const { dataValues: { DocumentoId } } = await Documento.findOne({ where: { DocumentoGUID: Requisicao.params.guid } })

        const RegistroArquivo = {
            ArquivoBase64: Requisicao.body.DocumentoBase64,
        }
        const { ArquivoId } = await Arquivo.create(RegistroArquivo)

        const RegistroDoDocumentoExtra = {
            DocumentoExtraNome: Requisicao.body.DocumentoNome,
            DocumentoExtraGUID: crypto.randomUUID(),
            ArquivoOriginalId: ArquivoId,
            DocumentoId
        }
        const { DocumentoExtraId } = await DocumentoExtra.create(RegistroDoDocumentoExtra)
        
        const DocumentoBase64Atualizado = await ConstruirPaginaComDadosDeAssinatura(RegistroArquivo.ArquivoBase64, DocumentoId)

        const { ArquivoId: ArquivoEmAndamentoId } = await Arquivo.create({ ArquivoBase64: DocumentoBase64Atualizado })

        DocumentoExtra.update({ ArquivoEmAndamentoId }, { where: { DocumentoExtraId } })

        Resposta.sendStatus(200)

    } catch (Erro) {
        console.log(Erro)
        Resposta.sendStatus(500)
    }

    
}