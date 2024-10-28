const crypto = require("crypto")

module.exports = (BufferDoDocumento) =>  {

    const Hash = crypto.createHash('sha256')
    Hash.update(BufferDoDocumento)
    const Resultado = Hash.digest('hex')

    return Resultado
    
}