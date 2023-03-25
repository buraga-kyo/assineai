const crypto = require("crypto");

module.exports = (Base64ChavePublica, Base64Assinatura, DocumentoBase64) => {
    ChavePublica = crypto.createPublicKey({
        key: Buffer.from(Base64ChavePublica, 'base64'),
        type: 'spki',
        format: 'der',
    })

    const Hash = crypto.createVerify("SHA256")
    Hash.update(DocumentoBase64)
    Hash.end()

    const Resultado = Hash.verify(ChavePublica, Buffer.from(Base64Assinatura, 'base64'))
    return Resultado
}
