const CriarRegistros = require("../Consultas/CriarRegistros");
const CriarPaginaDeAssinaturaDoPDF = require("./CriarPaginaDeAssinaturaDoPDF");

module.exports = async (Requisicao, Resposta, ProximaFuncao) => {
    
    const DocumentoBase64 = Requisicao.body.DocumentoBase64
    const IdDoDocumento = await CriarRegistros.Documento(Requisicao.body.DocumentoNome, DocumentoBase64);

    const RegistroDoSignatario = {
        SignatarioNome: Requisicao.body.SignatarioNome,
        SignatarioEmail: Requisicao.body.SignatarioEmail,
        SignatarioModoAutenticacao: Requisicao.body.SignatarioModoAutenticacao,
        SignatarioIp: Requisicao.connection.remoteAddress || Requisicao.socket.remoteAddress || Requisicao.connection.socket.remoteAddress,
        SignatarioDispositivo: JSON.stringify(Requisicao.headers),
        SignatarioToken: Requisicao.body.SignatarioToken,
        DocumentoId: IdDoDocumento
    };

    const IdDoSignatario = await CriarRegistros.Signatario(RegistroDoSignatario)

    const DocumentoBase64Atualizado = await CriarPaginaDeAssinaturaDoPDF(DocumentoBase64)

    console.log(DocumentoBase64Atualizado)
    console.log(IdDoSignatario)
    
    Resposta.sendStatus(200)

}