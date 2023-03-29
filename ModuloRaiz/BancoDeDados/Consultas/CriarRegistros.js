const { Documento, Signatario, PDFBase64 } = require("../Conector").Tabelas;

exports.Documento = async (RegistroDoDocumento) => {

    const { DocumentoId } = await Documento.create(RegistroDoDocumento)

    return DocumentoId
};

exports.PDFBase64 = async (RegistroDoPDFBase64) => {
    PDFBase64.create(RegistroDoPDFBase64)
};

exports.Signatario = async (DadosDoSignatario) => {
    Signatario.create(DadosDoSignatario)
};



