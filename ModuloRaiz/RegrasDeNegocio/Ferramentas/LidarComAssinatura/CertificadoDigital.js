const cmd = require('node-cmd');

module.exports = (NomeDoArquivo) => {
    
	return new Promise((resolve, reject) => {

        const comando = 'cd '+process.env.BaseDir+'\\Arquivos\\Permanente & java -jar JSignPdf.jar -d '+process.env.BaseDir+'\\Arquivos\\Temporario -kst PKCS12 -ksf cert.pfx -ksp '+process.env.SENHA_DO_CERTIFICADO+' -pr DISALLOW_PRINTING '+process.env.BaseDir+'\\Arquivos\\Temporario\\'+NomeDoArquivo

        cmd.run(comando, (err, data, stderr) => {

            //resolve(false);

            if (err == null) {
				console.log('certificado adicionado com sucesso')
                resolve(true);
            } else {
				console.log('Ocorreu um erro ao assinar pdf com certificado: ')
                console.log(err);
            }
        })

    });

}