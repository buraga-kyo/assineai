const crypto = require("crypto");

module.exports = (DocumentoBase64) => {

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
    Hash.update(DocumentoBase64)
    Hash.end()
    const Assinatura = Hash.sign(ChavePrivada)

    return {
        ChavePublica,
        Assinatura: Assinatura.toString('base64')
    }
}