const crypto = require("crypto");
const formidable = require('formidable');
const fs = require('fs');
const FileReader = require('FileReader');

exports.RecuperarHash = (req,res) => {

    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {

        // getAsByteArray(files).then((btes) => {
        //     console.log(btes)
        // })
    })

    // function readFile(file) {
    //     return new Promise((resolve, reject) => {
    //       // Create file reader
    //       let reader = new FileReader()
      
    //       // Register event listeners
    //       reader.addEventListener("loadend", e => resolve(e.target.result))
    //       reader.addEventListener("error", reject)
      
    //       // Read file
    //       reader.readAsArrayBuffer(file)
    //     })
    //   }

    // async function getAsByteArray(file) {
    //     return new Uint8Array(await readFile(file))
    // }

    function getByteArray(filePath){
        let fileData = fs.readFileSync(filePath).toString('hex');
        let result = []
        for (var i = 0; i < fileData.length; i+=2)
          result.push('0x'+fileData[i]+''+fileData[i+1])
        return result;
    }    
    // const Hash = crypto.createSign('SHA256')
    // Hash.update(body.Documento)
    // Hash.end()
}

exports.GerarParDeChaves = (req,res) => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 512,
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

    res.send({ChavePrivada, ChavePublica})
}

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
