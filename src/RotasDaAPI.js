const rotas = require("express").Router();
const CriarRegistro = require("./Consultas/CriarRegistro");
const CriarPDFDocumento = require("./Utils/CriarPDFDocumento");
const AutenticacaoLocal = require("./Consultas/Autenticacao/AutenticacaoLocal");
const Assinatura = require("./Utils/Assinatura");
const ConverterPDFParaBase64 = require("./Utils/ConverterPDFParaBase64");
const FileReader = require('FileReader');
const ConverterPDFParaArrayBuffer = require("./Utils/ConverterPDFParaArrayBuffer");
const RecuperarBase64ChavePrivada = require("./Utils/RecuperarBase64ChavePrivada");
const formidable = require('formidable');

rotas.get("/GerarParDeChaves", Assinatura.GerarParDeChaves);

rotas.post("/AssinarPDF", async (req, res) => {
    const {ArrayBuffer, Base64ChavePrivada} = await ConverterPDFParaArrayBuffer(req)
    const ArrayUint8 = new Uint8Array(ArrayBuffer)
    res.send(Assinatura.AssinarPDF(ArrayUint8, Base64ChavePrivada))
});

rotas.post("/CriarSignatario", CriarRegistro.Signatario);
rotas.post("/CriarDocumento", CriarRegistro.Documento);
// rotas.post("/CriarDocumentoViaAPI", CriarRegistro.DocumentoViaAPI);

rotas.get("/AssinarComCertificado", Assinatura.AssinarPDFComCertificadoDigital);
rotas.post("/VerificarAssinatura", Assinatura.VerificarAssinatura);

/* Rotas de Autenticação */
rotas.post("/criarusuario", AutenticacaoLocal.VerificarUsuarioCadastrado, AutenticacaoLocal.CriarUsuario);
rotas.post("/logarusuario", AutenticacaoLocal.LogarUsuario);

rotas.post("/ConverterPDFParaBase64", async (req, res) => {
    res.send(await ConverterPDFParaBase64(req))
});

rotas.post("/documento", 
    CriarRegistro.Documento, 
    CriarRegistro.Signatario, 
    CriarPDFDocumento, 
    Assinatura.Assinar, 
    Assinatura.VerificarAssinatura
);

module.exports = rotas;
