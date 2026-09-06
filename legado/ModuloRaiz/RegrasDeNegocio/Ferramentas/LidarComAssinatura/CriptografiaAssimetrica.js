const crypto = require("crypto");

module.exports = (Documento) => {

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
    
    const AssinaturaSHA256 = crypto.createSign('SHA256')
    AssinaturaSHA256.update(Documento)
    AssinaturaSHA256.end()
    const BufferDocumentoAssinado = AssinaturaSHA256.sign(ChavePrivada)

    return {
        ChavePublica,
        Assinatura: BufferDocumentoAssinado.toString('base64')
    }
}