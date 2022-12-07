const rotas = require("express").Router();
const CriarRegistro = require("./Consultas/CriarRegistro");
const CriarPDFDocumento = require("./Utils/CriarPDFDocumento");
const AutenticacaoLocal = require("./Consultas/Autenticacao/AutenticacaoLocal");
const Assinatura = require("./Utils/Assinatura");
const { default: ConverterPDFParaBase64 } = require("./Utils/ConverterPDFParaBase64");


rotas.get("/GerarParDeChaves", Assinatura.GerarParDeChaves);

rotas.post("/CriarSignatario", CriarRegistro.Signatario);
rotas.post("/CriarDocumento", CriarRegistro.Documento);
// rotas.post("/CriarDocumentoViaAPI", CriarRegistro.DocumentoViaAPI);

rotas.get("/AssinarComCertificado", Assinatura.AssinarPDFComCertificadoDigital);
rotas.post("/VerificarAssinatura", Assinatura.VerificarAssinatura);

/* Rotas de Autenticação */
rotas.post("/criarusuario", AutenticacaoLocal.VerificarUsuarioCadastrado, AutenticacaoLocal.CriarUsuario);
rotas.post("/logarusuario", AutenticacaoLocal.LogarUsuario);

rotas.post("/ConverterPDFParaBase64", (req, res) => {
    res.send(ConverterPDFParaBase64(req));
    // const form = new formidable.IncomingForm();
    // form.parse(req, (err, fields, {file}) => {
    //     res.send(fs.readFileSync(file.filepath).toString("base64"));
    // })
})

module.exports = rotas;
