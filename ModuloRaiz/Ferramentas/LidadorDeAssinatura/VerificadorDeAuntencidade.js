const crypto = require("crypto");
const formidable = require('formidable');
const FileReader = require('FileReader');
const fs = require('fs');
const { sign } = require('pdf-signer-brazil');

exports.VerificarAssinaturaIndividual = (Base64ChavePublica, Base64Assinatura, ArrayUint8) => {
    ChavePublica = crypto.createPublicKey({
        key: Buffer.from(Base64ChavePublica, 'base64'),
        type: 'spki',
        format: 'der',
    })

    const Hash = crypto.createVerify("SHA256")
    Hash.update(ArrayUint8)
    Hash.end()

    const Resultado = Hash.verify(ChavePublica, Buffer.from(Base64Assinatura, 'base64'))
    return Resultado
}