const crypto = require("crypto")

module.exports = (Base64) =>  {

    const BufferDoDocumento = Buffer.from(Base64, 'base64')
    const Hash = crypto.createHash('sha256')
    Hash.update(BufferDoDocumento)
    const Resultado = Hash.digest('hex')
    return Resultado
    
}