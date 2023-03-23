const fs = require('fs');
const { sign } = require('pdf-signer-brazil');

exports.AssinarPDFComCertificadoDigital = () => {
   
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