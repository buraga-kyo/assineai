const crypto = require("crypto");
const formidable = require('formidable');
const FileReader = require('FileReader');
const fs = require('fs');
const { sign } = require('pdf-signer-brazil');


exports.Assinar = ({ body }, res, ProximaFuncao) => {

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'der',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'der',
        },
    })
 
    ChavePrivada = privateKey.toString('base64')
    ChavePublica = publicKey.toString('base64')

    ChavePrivada = crypto.createPrivateKey({
        key: Buffer.from(ChavePrivada, 'base64'),
        type: 'pkcs8',
        format: 'der',
    })
    
    const Hash = crypto.createSign('SHA256')
    Hash.update(body.Documento)
    Hash.end()
    const Assinatura = Hash.sign(ChavePrivada)

	body.ChavePublica = ChavePublica
	body.Assinatura = Assinatura
	
	ProximaFuncao()
}