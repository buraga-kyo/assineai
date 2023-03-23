const { Documento, Signatario } = require("../Conector").Tabelas;

exports.Documento = async (DocumentoNome, DocumentoBase64) => {

    let Registro = {
        DocumentoNome,
        DocumentoBase64
    }

    const { id } = await Documento.create(Registro)

    return id
};

exports.Signatario = async (DadosDoSignatario) => {

    const { id } = await Signatario.create(DadosDoSignatario)

    return id
};



