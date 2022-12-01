const rotas = require("express").Router();
const CriarRegistro = require("./Consultas/CriarRegistro");
const CriarPDFDocumento = require("./Utils/CriarPDFDocumento");
const AutenticacaoLocal = require("./Consultas/Autenticacao/AutenticacaoLocal");
const Assinatura = require("./Utils/Assinatura");

rotas.get("/AssinarComCertificado", Assinatura.AssinarPDFComCertificadoDigital);
rotas.post("/VerificarAssinatura", Assinatura.VerificarAssinatura);
rotas.post("/CriarRegistro", 
    CriarRegistro.Documento, 
    CriarRegistro.Signatario, 
    CriarPDFDocumento, 
    Assinatura.Assinar, 
    Assinatura.VerificarAssinatura
);

/* Rotas de Autenticação */
rotas.post("/criarusuario", AutenticacaoLocal.VerificarUsuarioCadastrado, AutenticacaoLocal.CriarUsuario);
rotas.post("/logarusuario", AutenticacaoLocal.LogarUsuario);

module.exports = rotas;
