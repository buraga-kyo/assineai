const rotas = require("express").Router();
const CriarRegistro = require("./Consultas/CriarRegistro");
const CriarRegistros = require("./Consultas/CriarRegistros");
//const CriarPDFDocumento = require("./Utils/CriarPDFDocumento");
const AutenticacaoLocal = require("./Consultas/Autenticacao/AutenticacaoLocal");
const Assinatura = require("./Utils/Assinatura");
const ConverterPDFParaBase64 = require("./Utils/ConverterPDFParaBase64");
const ConverterPDFParaArrayBuffer = require("./Utils/ConverterPDFParaArrayBuffer");
const CriarDocumentoViaAPI = require("./Utils/CriarDocumentoViaAPI");

rotas.post("/CriarDocumentoViaAPI", CriarDocumentoViaAPI);

rotas.get("/GerarParDeChaves", Assinatura.GerarParDeChaves);

rotas.post("/CriarSignatario", CriarRegistro.Signatario);
rotas.post("/CriarDocumento", CriarRegistro.Documento);

rotas.get("/AssinarComCertificado", Assinatura.AssinarPDFComCertificadoDigital);
rotas.post("/VerificarAssinatura", Assinatura.VerificarAssinatura);

rotas.post("/ConverterPDFParaBase64", async (req, res) => {
    res.send(await ConverterPDFParaBase64(req))
});

rotas.post("/AssinarPDF", async (req, res) => {
    const {ArrayBuffer, Base64ChavePrivada} = await ConverterPDFParaArrayBuffer(req)
    const ArrayUint8 = new Uint8Array(ArrayBuffer)
    res.send(Assinatura.AssinarPDF(ArrayUint8, Base64ChavePrivada))
});

rotas.post("/documento", 
    CriarRegistro.Documento, 
    CriarRegistro.Signatario, 
    //CriarPDFDocumento, 
    Assinatura.Assinar, 
    Assinatura.VerificarAssinatura
);

/* Rotas de Autenticação */
rotas.post("/criarusuario", AutenticacaoLocal.VerificarUsuarioCadastrado, AutenticacaoLocal.CriarUsuario);
rotas.post("/logarusuario", AutenticacaoLocal.LogarUsuario);

module.exports = rotas;
