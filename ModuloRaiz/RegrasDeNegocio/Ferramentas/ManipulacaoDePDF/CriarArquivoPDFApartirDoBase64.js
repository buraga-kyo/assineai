const fs = require("fs");

module.exports = (CaminhoDoArquivo, DocumentoBase64) =>  {

    return new Promise((resolve, reject) => {

        fs.writeFile(CaminhoDoArquivo, DocumentoBase64, 'base64', Erro => {
            if (Erro) {
                console.log("CriarArquivoPDFApartirDoBase64.js")
                reject(Erro);
            } else {
                resolve(true);
            }
        });

    });

}