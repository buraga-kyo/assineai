const crypto = require("crypto");

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

exports.VerificarAssinatura = ({ body: {Documento, ChavePublica, Assinatura} }, res) => {

    ChavePublica = crypto.createPublicKey({
        key: Buffer.from(ChavePublica, 'base64'),
        type: 'spki',
        format: 'der',
    })

	const Hash = crypto.createVerify("SHA256")
	Hash.update(Documento)
	Hash.end()

	const Resultado = Hash.verify(ChavePublica, Buffer.from(Assinatura, 'base64'))
	res.send({ Resultado })
}
