const rotas = require("express").Router();
const CriarRegistro = require("./Consultas/CriarRegistro");
const CriarPDFDocumento = require("./Utils/CriarPDFDocumento");
const AutenticacaoLocal = require("./Consultas/Autenticacao/AutenticacaoLocal");
const Assinatura = require("./Utils/Assinatura");

rotas.post("/CriarSignatario", CriarRegistro.Signatario);
rotas.post("/CriarDocumento", CriarRegistro.Documento);
rotas.post("/CriarDocumentoViaAPI", CriarRegistro.DocumentoViaAPI);

rotas.get("/AssinarComCertificado", Assinatura.AssinarPDFComCertificadoDigital);
rotas.post("/VerificarAssinatura", Assinatura.VerificarAssinatura);


/* Rotas de Autenticação */
rotas.post("/criarusuario", AutenticacaoLocal.VerificarUsuarioCadastrado, AutenticacaoLocal.CriarUsuario);
rotas.post("/logarusuario", AutenticacaoLocal.LogarUsuario);

module.exports = rotas;
