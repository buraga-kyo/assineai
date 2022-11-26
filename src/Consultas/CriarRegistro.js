const { Documento, Signatario } = require("../BancoDeDados/Conector").Tabelas;

exports.Documento = ({ body: {DocumentoNome, DocumentoBase64}, body }, resultado, proximaFuncao) => {
    
    const Registro = {
        DocumentoNome,
        DocumentoBase64
    };

    Documento.create(Registro)
        .then(({ id }) => {
            body.DocumentoId = id
            resultado.status(200)
            proximaFuncao()
        })
        .catch(erro => resultado.status(500).send(erro));
};

exports.Signatario = (requisicao, resultado, proximaFuncao) => {

    const Registro = {
        SignatarioNome: requisicao.body.SignatarioNome,
        SignatarioEmail: requisicao.body.SignatarioEmail,
        SignatarioModoAutenticacao: requisicao.body.SignatarioModoAutenticacao,
        SignatarioIp: requisicao.connection.remoteAddress || requisicao.socket.remoteAddress || requisicao.connection.socket.remoteAddress,
        SignatarioDispositivo: JSON.stringify(requisicao.headers),
        SignatarioToken: requisicao.body.SignatarioToken,
        DocumentoId: requisicao.body.DocumentoId
    };

    Signatario.create(Registro)
        .then(resposta => {
            resultado.status(200)
            //resultado.send('resposta')
            proximaFuncao()
        })
        .catch(erro => resultado.status(500).send(erro));
};


