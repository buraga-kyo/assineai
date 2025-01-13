const cmd = require('node-cmd');
const { spawn } = require('child_process');

module.exports = (NomeDoArquivo) => {

    return new Promise((resolve, reject) => {

        const { exec } = require('child_process');

        const command = 'cd '+process.env.BaseDir+'\\Arquivos\\Permanente & java -jar JSignPdf.jar -d ' + process.env.BaseDir + '\\Arquivos\\Temporario -kst PKCS12 -ksf cert.pfx -ksp ' + process.env.SENHA_DO_CERTIFICADO + ' -pr DISALLOW_PRINTING ' + process.env.BaseDir + '\\Arquivos\\Temporario\\' + NomeDoArquivo;

        const options = {
            windowsHide: true,
        };

        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            resolve(true);
        });

        /*const diretorioOndeComandoSeraExecutado = process.env.BaseDir+'\\Arquivos\\Permanente';

        const argumentos = [
            '-jar',
            'JSignPdf.jar',
            '-d',
            process.env.BaseDir+'\\Arquivos\\Temporario',
            '-kst',
            'PKCS12',
            '-ksf',
            'cert.pfx',
            '-ksp',
            process.env.SENHA_DO_CERTIFICADO,
            '-pr',
            'DISALLOW_PRINTING',
            process.env.BaseDir+'\\Arquivos\\Temporario\\'+NomeDoArquivo,
        ];

        const processo = spawn('java', argumentos, {
            cwd: diretorioOndeComandoSeraExecutado,
            detached: true, 
            stdio: 'ignore',
            windowsHide: true,
            shell: false,
        });

        // Desanexa o processo
        processo.unref();

        console.log('Comando executado com sucesso!');

        resolve(true);*/

        /** 
        const comando = 'cd '+process.env.BaseDir+'\\Arquivos\\Permanente & java -jar JSignPdf.jar -d '+process.env.BaseDir+'\\Arquivos\\Temporario -kst PKCS12 -ksf cert.pfx -ksp '+process.env.SENHA_DO_CERTIFICADO+' -pr DISALLOW_PRINTING '+process.env.BaseDir+'\\Arquivos\\Temporario\\'+NomeDoArquivo

        cmd.run(comando, (err, data, stderr) => {

            if (err == null) {
                console.log('certificado adicionado com sucesso .......')
                resolve(true);
            } else {
                console.log('CertificadoDigital.js')
                reject(err)
            }

        })*/

    });

}