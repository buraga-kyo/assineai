const rotas = require("express").Router();
const CriarRegistro = require("./Consultas/CriarRegistro");
const CriarPDFDocumento = require("./Utils/CriarPDFDocumento");
const AutenticacaoLocal = require("./Consultas/Autenticacao/AutenticacaoLocal");
const Assinatura = require("./Utils/Assinatura");
const crypto = require("crypto");

rotas.post("/documento", 
    CriarRegistro.Documento, 
    CriarRegistro.Signatario, 
    CriarPDFDocumento, 
    Assinatura.Assinar, 
    Assinatura.VerificarAssinatura
);

rotas.post("/verificar", Assinatura.VerificarAssinatura);

/* Rotas de Autenticação */
rotas.post("/criarusuario", AutenticacaoLocal.VerificarUsuarioCadastrado, AutenticacaoLocal.CriarUsuario);
rotas.post("/logarusuario", AutenticacaoLocal.LogarUsuario);

rotas.post("/teste", (req, res) => {

    const { publicKey: ChavePublica1, privateKey: ChavePrivada1 } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    })

    const { publicKey: ChavePublica2, privateKey: ChavePrivada2 } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 512,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    })
 
    // ChavePrivada = privateKey.toString('base64')
    // ChavePublica = publicKey.toString('base64')

    // ChavePrivada = crypto.createPrivateKey({
    //     key: Buffer.from(ChavePrivada, 'base64'),
    //     type: 'pkcs8',
    //     format: 'der',
    // })
    
    // const sign = crypto.createSign('SHA256')
    // sign.update(Documento)
    // sign.end()
    // const assinatura = sign.sign(ChavePrivada)

	// body.ChavePublica = ChavePublica
	// body.assinatura = assinatura

    res.send({
        ChavePublica1,
        ChavePrivada1,
        ChavePublica2,
        ChavePrivada2,
 
    })
});


module.exports = rotas;
