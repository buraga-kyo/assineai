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

exports.AssinarPDF = (ArrayUint8, base64ChavePrivada) => {
    // const Hash = crypto.createHash('SHA256').update(ArrayUint8).digest('hex');

    ChavePrivada = crypto.createPrivateKey({
        key: Buffer.from(base64ChavePrivada, 'base64'),
        type: 'pkcs8',
        format: 'der',
    })

    const Hash = crypto.createSign('SHA256').update(ArrayUint8).end()
    const Assinatura = Hash.sign(ChavePrivada)

    return Assinatura.toString('base64')
}

exports.GerarChavePrivada = (base64ChavePrivada) => {

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


exports.AssinarPDFComCertificadoDigital = (req,res) => {
   
    const SenhaDoCertificado = process.env.SENHA_DO_CERTIFICADO
    const BufferDoCertificado = fs.readFileSync(`./Arquivos/cert.pfx`)
    const BufferDoPDF = fs.readFileSync(`./Arquivos/Bol.pdf`)
    const ConfiguracoesDaAssinatura = {
        reason: 'PLANO',
        email: 'sprtj@protonmail.com',
        location: 'Rio de Janeiro, BR',
        signerName: 'BRAGA US',
        annotationAppearanceOptions: {
            signatureCoordinates: { left: 20, bottom: 120, right: 190, top: 20 },
            signatureDetails: [
                {
                    value: 'BRAGA US',
                    fontSize: 5,
                    transformOptions: { rotate: 0, space: 2, tilt: 0, xPos: 0, yPos: 32 },
                },
                {
                    value: 'Este arquivo foi assinado digitalmente',
                    fontSize: 5,
                    transformOptions: { rotate: 0, space: 2, tilt: 0, xPos: 0, yPos: 25.4 },
                },
                {
                    value: 'Assinado',
                    fontSize: 5,
                    transformOptions: { rotate: 0, space: 2, tilt: 0, xPos: 0, yPos: 18 },
                },
                {
                    value: 'Verifique o arquivo em verificador.iti.gov.br',
                    fontSize: 5,
                    transformOptions: { rotate: 0, space: 2, tilt: 0, xPos: 0, yPos: 11 },
                },
            ]
        },
    }

    const PDFAssinado = sign(
        BufferDoPDF, 
        BufferDoCertificado, 
        SenhaDoCertificado, 
        ConfiguracoesDaAssinatura
    ).then(BufferDoPDFAssinado => {
        fs.writeFileSync('./Arquivos/signeds.pdf', BufferDoPDFAssinado)
        res.send(BufferDoPDFAssinado)
    })

}

    // var form = new formidable.IncomingForm();
    // form.parse(req, (err, fields, files) => {

    //     getAsByteArray(files).then((btes) => {
    //         console.log(btes)
    //     })
    // })

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

    // function getByteArray(filePath){
    //     let fileData = fs.readFileSync(filePath).toString('hex');
    //     let result = []
    //     for (var i = 0; i < fileData.length; i+=2)
    //       result.push('0x'+fileData[i]+''+fileData[i+1])
    //     return result;
    // }    
    // const Hash = crypto.createSign('SHA256')
    // Hash.update(body.Documento)
    // Hash.end()
