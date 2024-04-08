// const fs = require('fs');
// const { sign } = require('pdf-signer-brazil');
const cmd = require('node-cmd');

module.exports = (NomeDoArquivo) => {
	
	console.log(process.env)
	
	console.log(NomeDoArquivo)
    
	return new Promise((resolve, reject) => {

        const comando = 'cd '+process.env.BaseDir+'\\Arquivos\\Permanente & java -jar JSignPdf.jar -d '+process.env.BaseDir+'\\Arquivos\\Temporario -kst PKCS12 -ksf cert.pfx -ksp '+process.env.SENHA_DO_CERTIFICADO+' -pr DISALLOW_PRINTING '+process.env.BaseDir+'\\Arquivos\\Temporario\\'+NomeDoArquivo
        console.log(comando)

        cmd.run(comando, (err, data, stderr) => {

            console.log(err)
            console.log(data)
            console.log(stderr)

            if (err == null) {
                resolve(true);
            } else {
                console.log(err);
            }
        })

    });

    // const SenhaDoCertificado = process.env.SENHA_DO_CERTIFICADO
    // const BufferDoCertificado = fs.readFileSync(`./ArquivosTemporarios/cert.pfx`)
    // const BufferDoPDF = fs.readFileSync(CaminhoDoArquivoPDFA)
    // const ConfiguracoesDaAssinatura = {
    //     reason: 'PLANO',
    //     email: 'sprtj@protonmail.com',
    //     location: 'Rio de Janeiro, BR',
    //     signerName: 'BRAGA US',
    //     annotationAppearanceOptions: {
    //         signatureCoordinates: { left: 20, bottom: 120, right: 190, top: 20 },
    //         signatureDetails: [
    //             {
    //                 value: 'BRAGA US',
    //                 fontSize: 5,
    //                 transformOptions: { rotate: 0, space: 2, tilt: 0, xPos: 0, yPos: 32 },
    //             },
    //             {
    //                 value: 'Este arquivo foi assinado digitalmente',
    //                 fontSize: 5,
    //                 transformOptions: { rotate: 0, space: 2, tilt: 0, xPos: 0, yPos: 25.4 },
    //             },
    //             {
    //                 value: 'Assinado',
    //                 fontSize: 5,
    //                 transformOptions: { rotate: 0, space: 2, tilt: 0, xPos: 0, yPos: 18 },
    //             },
    //             {
    //                 value: 'Verifique o arquivo em verificador.iti.gov.br',
    //                 fontSize: 5,
    //                 transformOptions: { rotate: 0, space: 2, tilt: 0, xPos: 0, yPos: 11 },
    //             },
    //         ]
    //     },
    // }

    // return new Promise(async (resolve, reject) => {

    //     const BufferDoPDFAssinado = await sign(BufferDoPDF, BufferDoCertificado, SenhaDoCertificado, ConfiguracoesDaAssinatura)
    //     fs.writeFileSync('./ArquivosTemporarios/cert'+NomeDoArquivo, BufferDoPDFAssinado)
    //     resolve(BufferDoPDFAssinado)

    // })

}