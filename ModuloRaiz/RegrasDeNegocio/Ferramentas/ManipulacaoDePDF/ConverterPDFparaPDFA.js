const fs = require("fs");
const cmd = require('node-cmd');

module.exports = (CaminhoDoArquivo, NomeDoArquivo, DocumentoBase64) =>  {

    const NomeDoPDFA = "_"+NomeDoArquivo

    return new Promise((resolve, reject) => {

        fs.writeFile(CaminhoDoArquivo, DocumentoBase64, 'base64', error => {
            if (error) {
                throw error;
            } else {

                cmd.run('cd ./ArquivosTemporarios & gswin32c -dPDFA=1 -dBATCH -dNOPAUSE -dNOOUTERSAVE -dPDFSETTINGS=/printer -dCompatibilityLevel="1.4" -dPDFACompatibilityPolicy=1 -dUseCIEColor -sProcessColorModel=DeviceRGB -sColorConversionStrategy=RGB -sDEVICE=pdfwrite -sOutputFile="'+NomeDoPDFA+'" "'+NomeDoArquivo+'" "PDFA_def.ps"', (err, data, stderr) => {
                    if (err == null) {
                        resolve(NomeDoPDFA);
                    } else {
                        console.log(err);
                    }
                })

            }
        });
    });

}